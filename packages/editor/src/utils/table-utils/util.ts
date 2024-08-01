export type TableCellType = {
  _rowIndex?: number;
  _colIndex?: number;
  _startRowIndex?: number;
  _endRowIndex?: number;
  _startColIndex?: number;
  _endColIndex?: number;
  rowspan?: number;
  colspan?: number;
  width: number;
  height: number;
};
export type TableCellRequired = Required<TableCellType>;

const getSpanValue = (span?: number) => {
  return span || 1;
};

/**
 * 标记table单元格行和列的范围、收集列数据
 * @param rows 二维数组（标题行|合计行）
 * @return _rows: 带标记的表格数据  _cols：每一列组成的数组
 */
const markTable = (tableRows: Array<Array<TableCellType>>) => {
  let _rows = JSON.parse(JSON.stringify(tableRows)) as Array<Array<TableCellType>>; // 标记了列和行范围的二维数据
  let colsLength = _rows[0].reduce((total, cur) => total + getSpanValue(cur.colspan), 0); // 总列数
  let rowsLength = Array.from({ length: colsLength }, () => 0); // 每列的rowspan和
  let _cols = Array.from<unknown, Array<TableCellType>>({ length: colsLength }, () => []); // 每一列的数据

  _rows.forEach((cols, rowI) => {
    cols.forEach((item, colI) => {
      // 标记原始位置坐标（二维数组中的坐标）
      item._rowIndex = rowI;
      item._colIndex = colI;
      // 标记格子所占行范围[_srartRow, _endRow]
      item._startRowIndex = rowI;
      item._endRowIndex = rowI + getSpanValue(item.rowspan) - 1;

      // 瀑布流方式找到最左最短的列（rowspan最小的列）
      let { index } = rowsLength.reduce(
        (min, col, i) => {
          return col < min.height ? { index: i, height: col } : min;
        },
        { index: 0, height: rowsLength[0] }
      );

      // colspan>1的跨列：视图上属于多个列
      let offset = getSpanValue(item.colspan);
      while (offset > 0) {
        let _index = index + offset - 1;
        if (_index < colsLength) {
          // 单元格存入对应的列中
          _cols[_index].push({ ...item });
          rowsLength[_index] += getSpanValue(item.rowspan);
        }
        offset--;
      }

      // 标记格子所占列范围[_startCol, _endCol]
      item._startColIndex = index;
      item._endColIndex = item._startColIndex + getSpanValue(item.colspan) - 1;
    });
  });
  return { _rows, _cols } as { _rows: Array<Array<TableCellRequired>>, _cols: Array<Array<TableCellRequired>> };
};

/**
 * 标记数据行格子的列范围
 * @param dataRow 一维数组(数据行)
 * @return _data:带标记的数据行
 */
const markTableRow = (dataRow: Array<TableCellType>) => {
  let _dataRow = JSON.parse(JSON.stringify(dataRow)) as Array<TableCellType>;
  let startCol = 0;

  _dataRow.forEach((item, index) => {
    item._startColIndex = startCol;
    item._endColIndex = startCol + getSpanValue(item.colspan) - 1;
    item._colIndex = index;
    startCol = item._endColIndex + 1;
  });
  return { _dataRow } as { _dataRow: Array<TableCellRequired> };
};

/**
 * 判断2个行或列相交的状态 start<=end targetStart<=targetEnd
 * @param {*} start
 * @param {*} end
 * @param {*} targetStart
 * @param {*} targetEnd
 * @return false:不相交 | {}
 */
const getCellCross = (start: number, end: number, targetStart: number, targetEnd: number) => {
  if (end < targetStart || start > targetEnd) {
    return false;
  }
  let result = {
    start: start === targetStart, // 起始对齐
    end: end === targetEnd, // 结束对齐
    pass: start >= targetStart && end <= targetEnd, // 目标范围完全包含待比较的范围
    common: Math.min(end, targetEnd) - Math.max(start, targetStart) + 1, // 重叠的列数
    comCol: [Math.max(start, targetStart), Math.min(end, targetEnd)], // 重叠的列范围
  };
  return result;
};

/**
 * 获取表格二维数组指定列范围相交的所有单元格
 * @param {*} rows
 * @param {*} startCol
 * @param {*} enCol
 * @return []
 */
const findCols = (rows: Array<Array<TableCellType>>, startCol: number, enCol: number) => {
  let { _rows } = markTable(rows);
  let targetCells = [] as TableCellType[];
  _rows.forEach((rowData, rowIndex) => {
    let colIndex = rowData.findIndex((item) =>
      getCellCross(item._startColIndex, item._endColIndex, startCol, enCol)
    );
    if (colIndex > -1) {
      targetCells.push(rows[rowIndex][colIndex]);
    }
  });
  return targetCells;
};

/**
 * 找到所选单元格左右可合并的单元格[同一行&colspan范围相邻列&相同rowspan]
 * @param {*} rows
 * @param {*} rowIndex
 * @param {*} colIndex
 * @param {*} offset -1左侧 1右侧
 */
const findLeftRightCell = (rows: Array<Array<TableCellType>>, rowIndex: number, colIndex: number, offset: number) => {
  let { _rows } = markTable(rows);
  const curCell = _rows[rowIndex][colIndex];
  const targetCell = _rows[rowIndex][colIndex + offset];
  let isLeft =
    targetCell &&
    targetCell.rowspan === curCell.rowspan &&
    offset === -1 &&
    targetCell._endColIndex + 1 === curCell._startColIndex;
  let isRight =
    targetCell &&
    targetCell.rowspan === curCell.rowspan &&
    offset === 1 &&
    targetCell._startColIndex - 1 === curCell._endColIndex;
  if (isLeft || isRight) {
    return rows[rowIndex][colIndex + offset];
  }
  return null;
};

/**
 * 找到所选单元格上下可合并的单元格[rowspan范围相邻&相同colspan]
 * @param {*} rows
 * @param {*} rowIndex
 * @param {*} colIndex
 * @param {*} offset  -1上一行 1下一行
 */
const findTopBottomCell = (rows: Array<Array<TableCellType>>, rowIndex: number, colIndex: number, offset: number) => {
  let { _rows } = markTable(rows);
  const curCell = _rows[rowIndex][colIndex];
  let targetCell: TableCellType | undefined;
  let _rowIndex: TableCellType['_rowIndex'];
  let _colIndex: TableCellType['_colIndex'];
  _rows.forEach((rowData, ri) => {
    rowData.forEach((item, ci) => {
      const colResult = getCellCross(
        item._startColIndex,
        item._endColIndex,
        curCell._startColIndex,
        curCell._endColIndex
      );
      if (colResult && colResult.start && colResult.end) {
        if (offset === -1 && item._endRowIndex + 1 === curCell._startRowIndex) {
          targetCell = rows[ri][ci];
          _rowIndex = ri;
          _colIndex = ci;
        } else if (offset === 1 && item._startRowIndex - 1 === curCell._endRowIndex) {
          targetCell = rows[ri][ci];
          _rowIndex = ri;
          _colIndex = ci;
        }
      }
    });
  });
  if (targetCell && typeof _rowIndex === 'number' && typeof _colIndex === 'number') {
    return { targetCell, rowIndex: _rowIndex, colIndex: _colIndex };
  }
};

/**
 * 修正每一行单元格rowspan从1开始?
 * @param {*} rows
 */
const updateRowspan = (rows: Array<Array<TableCellType>>) => {
  rows.forEach((row) => {
    if (row.length > 1) {
      const minRowspan = row.reduce(
        (min, cur) => Math.min(min, getSpanValue(cur.rowspan)),
        getSpanValue(row[0].rowspan)
      );
      const disRowspan = minRowspan - 1;
      if (disRowspan > 0) {
        row.forEach((item) => (item.rowspan = getSpanValue(item.rowspan) - disRowspan));
      }
    }
  });
};

/**
 * rowspan都大于1的行向下填充空行
 * 一行中rowspan都大于1直接渲染表格错乱
 * @param {*} rows
 */
const patchNullRow = (rows: Array<Array<TableCellType>>) => {
  let i = 0;
  rows.forEach((item, index) => {
    let needFix = item.length && item.every(i => getSpanValue(i.rowspan) > 1);
    if (needFix) {
      rows.splice(index + i + 1, 0, []);
      i++;
    }
  });
};

export {
  getSpanValue,
  getCellCross,
  markTable,
  markTableRow,
  findCols,
  findLeftRightCell,
  findTopBottomCell,
  updateRowspan,
  patchNullRow
};
