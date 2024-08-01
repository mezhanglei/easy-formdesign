import { markTable, getCellCross, findLeftRightCell, findTopBottomCell, patchNullRow, updateRowspan, TableCellType, getSpanValue } from './util';

const CELL_DEFAULT_CONFIG = {
  rowspan: 1,
  colspan: 1,
  width: 100,
  height: 40,
};

type CallbackHandler = (params?: {
  rows?: Array<Array<TableCellType>>;
  rowIndex?: number;
  colIndex?: number;
  disabledHandles?: string[]
}) => void

export interface TableutilsOptions {
  minRetainRow?: number;
  minRetainCol?: number;
  minSplitHcolspan?: number;
  minSplitVrowspan?: number;
  fixRowType?: number;
  onUpdate?: CallbackHandler;
}

class TableUtils {
  rows: Array<Array<TableCellType>> = [];
  onUpdate?: CallbackHandler;
  options = {
    // 表格至少minRetainRow行
    minRetainRow: 0,
    // 表格至少minRetainCol列
    minRetainCol: 0,
    // 单元格水平拆分最小colspan
    minSplitHcolspan: 2,
    // 单元格垂直拆分最小rowspan
    minSplitVrowspan: 2,
    // rowspan错位修复方式  0:不处理; 1:修复rowspan最小为1; 2: 添加空行;
    fixRowType: 1,
    onUpdate: function () { },
  };
  static init({ rows, cols, ...rest }) {
    return Array.from({ length: rows }, () => {
      return Array.from({ length: cols }, () => ({
        ...CELL_DEFAULT_CONFIG,
        ...rest,
      }));
    });
  }
  constructor(rows?: TableUtils['rows'], options?: TableutilsOptions) {
    this.rows = rows || [];
    this.onUpdate = options?.onUpdate;
    this.options = { ...this.options, ...options };
  }

  getDisabledHandles(rowIndex = -1, colIndex = -1) {
    let disabledHandles: string[] = [];
    let curCell = this.rows[rowIndex] && this.rows[rowIndex][colIndex];
    if (curCell) {
      // 删除行：该行rospan需小于总行数
      let totalRows = this.rows.reduce(
        (total, cur) => total + Math.min(...cur.map(item => getSpanValue(item.rowspan))),
        0
      );
      if (totalRows - getSpanValue(curCell.rowspan) < this.options.minRetainRow) {
        disabledHandles.push('delRow');
      }
      // 删除列：该列copspan需小于总列数
      const totalCols = this.rows[0].reduce(
        (total, cur) => total + getSpanValue(cur.colspan),
        0
      );
      if (totalCols - getSpanValue(curCell.colspan) < this.options.minRetainCol) {
        disabledHandles.push('delCol');
      }

      // 水平拆分
      if (getSpanValue(curCell.colspan) < this.options.minSplitHcolspan) {
        disabledHandles.push('splitH');
      }
      // 垂直拆分
      if (getSpanValue(curCell.rowspan) < this.options.minSplitVrowspan) {
        disabledHandles.push('splitV');
      }

      // 向左合并：该行左边单元格与当前rowspan需相等&colsapn范围相邻
      if (!findLeftRightCell(this.rows, rowIndex, colIndex, -1)) {
        disabledHandles.push('leftMerge');
      }
      // 向右合并
      if (!findLeftRightCell(this.rows, rowIndex, colIndex, 1)) {
        disabledHandles.push('rightMerge');
      }
      // 向上合并
      if (!findTopBottomCell(this.rows, rowIndex, colIndex, -1)) {
        disabledHandles.push('topMerge');
      }
      // 向下合并
      if (!findTopBottomCell(this.rows, rowIndex, colIndex, 1)) {
        disabledHandles.push('bottomMerge');
      }
    } else {
      disabledHandles = [
        'insertRow',
        'insertCol',
        'delRow',
        'delCol',
        'splitH',
        'splitV',
        'leftMerge',
        'rightMerge',
        'topMerge',
        'bottomMerge',
      ];
    }
    return disabledHandles;
  }

  // 修正每一行的rowspan
  // row3.rowpsan: 32333导致row4.rospan: 1不换行!!!, 1.updateRowspan修正rowspan从1开始 2.patchNullRow填充空行后渲染
  handFixRow() {
    if (this.options.fixRowType === 1) {
      updateRowspan(this.rows);
    } else if (this.options.fixRowType === 2) {
      patchNullRow(this.rows);
    }
  }

  // insertRow 单元格上|下方插入行  0:上方 1：下方
  insertRow(rowIndex: number, colIndex: number, offset: number, callback?: CallbackHandler) {
    if (this.getDisabledHandles(rowIndex, colIndex).includes('insertRow')) { return; }
    const { _rows } = markTable(this.rows);
    const curCell = this.rows[rowIndex][colIndex];
    // 目标行
    const targetRowIndex = offset ? rowIndex + getSpanValue(curCell.rowspan) : rowIndex; // 上方：当前row位置插入 下方：当前row位置+cur.rowspan

    // 找到目标单元格
    if (targetRowIndex < _rows.length) {
      _rows.forEach((rowData, ri) => {
        if (ri < targetRowIndex) {
          // 1.小于目标行的行: 找到每一行所有跨行到目标行的单元格
          rowData.forEach((item) => {
            // 注：此时无需获取具体目标单元格 let {_startRow，_endRow } = rows[targetRowIndex][props.activeCell.col]
            const state = getCellCross(
              item._startRowIndex,
              item._endRowIndex,
              targetRowIndex,
              targetRowIndex
            );
            if (state) {
              const _rowIndex = item._rowIndex || 0;
              const _colIndex = item._colIndex || 0;
              const crossCell = this.rows[_rowIndex][_colIndex];
              // 该单元格与目标单元格rowspan范围有交叉
              crossCell.rowspan = getSpanValue(crossCell.rowspan) + 1;
              crossCell.height = crossCell.height + CELL_DEFAULT_CONFIG.height;
            }
          });
        }
      });
      // 2.目标行位置拷贝行（a.直接复制当前行；b.可以计算设置col=1，设置每列宽和该行总列?）
      const newRow = this.rows[targetRowIndex].map((item) => ({
        ...CELL_DEFAULT_CONFIG,
        width: item.width,
        colspan: item.colspan,
      }));
      this.rows.splice(targetRowIndex, 0, newRow);
    } else {
      // 最后一行向下添加: 复制最后一行数据？
      const newRow = this.rows[this.rows.length - 1].map((item) => ({
        ...CELL_DEFAULT_CONFIG,
        width: item.width,
        colspan: item.colspan,
      }));
      this.rows.splice(targetRowIndex, 0, newRow);
    }
    const resultRow = offset ? rowIndex : rowIndex + 1;
    const resultData = {
      rows: this.rows,
      rowIndex: resultRow,
      colIndex: colIndex,
      disabledHandles: this.getDisabledHandles(resultRow, colIndex),
    };
    callback?.(resultData);
    this.onUpdate?.(resultData);
    return resultData;
  }

  // insertCol 单元格左侧|右侧插入列 0:左侧 1：右侧
  insertCol(rowIndex: number, colIndex: number, offset: number, callback?: CallbackHandler) {
    if (this.getDisabledHandles(rowIndex, colIndex).includes('insertCol')) { return; }
    const { _rows } = markTable(this.rows);
    const curCell = _rows[rowIndex][colIndex]; // 左侧右侧插入都以当前单元格为参照

    _rows.forEach((rowData, ri) => {
      if (rowIndex === ri) {
        // 1.当前行: 添加一个默认配置的单元格col:1
        this.rows[ri].splice(colIndex + offset, 0, {
          ...CELL_DEFAULT_CONFIG,
          rowspan: curCell.rowspan,
        });
      } else {
        if (offset) {
          // 2.1 向右添加：其他行找到最后一个在目标范围的单元格（与目标单元格纵向有交叉的单元格,col范围有重合）
          let _index = -1;
          rowData.forEach((item, index) => {
            if (
              getCellCross(
                item._startColIndex,
                item._endColIndex,
                curCell._startColIndex,
                curCell._endColIndex
              )
            ) {
              _index = index;
            }
          });
          if (_index > -1) {
            const cell = rowData[_index];
            const state = getCellCross(
              cell._startColIndex,
              cell._endColIndex,
              curCell._startColIndex,
              curCell._endColIndex
            );
            if (state && state?.end) {
              // 右侧已对齐
              this.rows[ri].splice(_index + offset, 0, {
                ...CELL_DEFAULT_CONFIG,
                rowspan: cell.rowspan,
                colspan: 1,
              });
            } else {
              // 右侧大于activeCell.col: cospan++ [最后一个在目标列范围的单元格右侧一定>=activeCell.col!]
              const _rowIndex = cell._rowIndex;
              const _colIndex = cell._colIndex;
              const crossCell = this.rows[_rowIndex][_colIndex];
              crossCell.colspan = getSpanValue(crossCell.colspan) + 1;
              crossCell.width += CELL_DEFAULT_CONFIG.width;
            }
          }
        } else {
          // 2.2 向左添加：其他行找到第一个在目标列范围的单元格 (与目标单元格纵向有交叉的单元格,col范围有重合)
          const _index = rowData.findIndex((item) => {
            return getCellCross(
              item._startColIndex,
              item._endColIndex,
              curCell._startColIndex,
              curCell._endColIndex
            );
          });
          if (_index > -1) {
            const cell = rowData[_index];
            const state = getCellCross(
              cell._startColIndex,
              cell._endColIndex,
              curCell._startColIndex,
              curCell._endColIndex
            );
            if (state && state?.start) {
              // 左侧已对齐: 添加一个默认配置的单元格col:1
              this.rows[ri].splice(_index + offset, 0, {
                ...CELL_DEFAULT_CONFIG,
                rowspan: cell.rowspan,
                colspan: 1,
              });
            } else {
              // 左侧小于activeCell.col: cospan++ [第一个在目标列范围的单元格左侧一定<=activeCell.col!]
              const _rowIndex = cell._rowIndex;
              const _colIndex = cell._colIndex;
              const crossCell = this.rows[_rowIndex][_colIndex];
              crossCell.colspan = getSpanValue(crossCell.colspan) + 1;
              crossCell.width += CELL_DEFAULT_CONFIG.width;
            }
          }
        }
      }
    });
    const resultCol = offset ? colIndex : colIndex + 1;
    const resultData = {
      rows: this.rows,
      rowIndex,
      colIndex: resultCol,
      disabledHandles: this.getDisabledHandles(rowIndex, resultCol),
    };
    callback?.(resultData);
    this.onUpdate?.(resultData);
    return resultData;
  }

  // delRow 删除单元格所在的行
  delRow(rowIndex: number, colIndex: number, callback?: CallbackHandler) {
    if (this.getDisabledHandles(rowIndex, colIndex).includes('delRow')) { return; }
    const { _rows } = markTable(this.rows);
    const curCell = _rows[rowIndex][colIndex];

    _rows.forEach((rowData, ri) => {
      if (ri < rowIndex) {
        // 1.1小于目标行: 找到每一行所有跨到该行的单元格
        rowData.forEach((item) => {
          const state = getCellCross(
            item._startRowIndex,
            item._endRowIndex,
            curCell._startRowIndex,
            curCell._endRowIndex
          );
          if (state) {
            // 该单元格与所选单元格rowspan范围有交叉
            const _rowIndex = item._rowIndex;
            const _colIndex = item._colIndex;
            const crossCell = this.rows[_rowIndex][_colIndex];
            crossCell.rowspan = getSpanValue(crossCell.rowspan) - state.common;
            crossCell.height -= curCell.height;
          }
        });
      } else if (ri > rowIndex) {
        // 2.2大于目标行
        const delIndex: number[] = [];
        rowData.forEach((item, index) => {
          const state = getCellCross(
            item._startRowIndex,
            item._endRowIndex,
            curCell._startRowIndex,
            curCell._endRowIndex
          );
          if (state) {
            delIndex.push(index);
            if (!state.pass) {
              // 未完全跨过删除后 下一行当前位置需要需新增未重叠部分！！！
              const nextRowAddCell = {
                ...this.rows[item._rowIndex][item._colIndex],
                rowspan: item.rowspan - state.common,
              };
              // 找到单元格下方的单元格
              const mergeTarget = findTopBottomCell(
                _rows,
                rowIndex,
                colIndex,
                1
              );
              if (mergeTarget) {
                this.rows[mergeTarget?.rowIndex].splice(mergeTarget?.colIndex + 1, 0, nextRowAddCell);
              }
            }
          }
        });
        const rowNewCells = this.rows[ri].filter(
          (_, index) => !delIndex.includes(index)
        );
        // 让不需要删除的单元格新组成一行 [禁止判断rowNewCells=0删除整行，改变rowindex]
        this.rows.splice(ri, 1, rowNewCells);
      }
    });

    // 2.删除所选单元格的行
    let curCellnextCellRow = rowIndex + curCell.rowspan;
    _rows[rowIndex].forEach((item) => {
      // 更新_rows获取最新2.1待插入的数据的位置
      const { _rows } = markTable(this.rows);
      // 当前行其他单元格rowspan>当前单元格: 删除该行后剩余rowspan需要填充到下一行 curCellnextCellRow
      if (item.rowspan > curCell.rowspan) {
        // 尝试寻找下一行目标位置右侧第一个[定位插入index]
        let targetCellCol = _rows[curCellnextCellRow].findIndex(
          (nextRowItem) => nextRowItem._startColIndex > item._endColIndex
        );
        if (targetCellCol === -1) {
          // 下一行目标位置左侧最后一个
          _rows[curCellnextCellRow].forEach((nextRowItem, index) => {
            if (nextRowItem._endColIndex < item._startColIndex) {
              targetCellCol = index + 1;
            }
          });
        }
        // 2.1当前下一行插入
        this.rows[curCellnextCellRow].splice(targetCellCol, 0, {
          ...item,
          rowspan: item.rowspan - curCell.rowspan,
          height: item.height - curCell.height
        });
      }
    });
    // 删除当前行
    this.rows.splice(rowIndex, 1);
    // 统一过滤空行
    const resultRows = this.rows.filter((item) => item.length !== 0);
    this.rows.splice(0, this.rows.length, ...resultRows);
    const resultData = {
      rows: this.rows,
      rowIndex: -1,
      colIndex: -1,
      disabledHandles: this.getDisabledHandles(-1, -1),
    };
    callback?.(resultData);
    this.onUpdate?.(resultData);
    return resultData;
  }

  // delCol 删除单元格所在的列
  delCol(rowIndex: number, colIndex: number, callback?: CallbackHandler) {
    if (this.getDisabledHandles(rowIndex, colIndex).includes('delCol')) { return; }
    const { _rows } = markTable(this.rows);
    const curCell = _rows[rowIndex][colIndex];

    // 删除每一行中有跨所选单元格的colspan范围
    _rows.forEach((rowData, ri) => {
      const delIndex: number[] = [];
      rowData.forEach((item, index) => {
        const state = getCellCross(
          item._startColIndex,
          item._endColIndex,
          curCell._startColIndex,
          curCell._endColIndex
        );
        if (state) {
          if (state.pass) {
            // 1.在范围完全跨过：需要删除
            delIndex.push(index);
          } else {
            // 2.在范围有交叉： colspan--
            const _rowIndex = item._rowIndex;
            const _colIndex = item._colIndex;
            const crossCell = this.rows[_rowIndex][_colIndex];
            crossCell.colspan = getSpanValue(crossCell.colspan) - state.common;
            crossCell.width -= curCell.width;
          }
        }
      });
      const rowNewCells = this.rows[ri].filter(
        (_, index) => !delIndex.includes(index)
      );
      // 让不需要删除的单元格新组成一行
      if (ri < this.rows.length) {
        this.rows.splice(ri, 1, rowNewCells);
      } else {
        this.rows.splice(ri - this.rows.length, 1, rowNewCells);
      }
    });
    // 如果只有1列?
    if (this.rows.every((item) => item.length === 1)) {
      this.rows.forEach((row) => row.forEach((item) => (item.rowspan = 1)));
    }
    // 统一过滤空行
    const resultRows = this.rows.filter((item) => item.length !== 0);
    this.rows.splice(0, this.rows.length, ...resultRows);

    this.handFixRow();
    const resultData = {
      rows: this.rows,
      rowIndex: -1,
      colIndex: -1,
      disabledHandles: this.getDisabledHandles(-1, -1),
    };
    callback?.(resultData);
    this.onUpdate?.(resultData);
    return resultData;
  }

  // splitV 水平拆分单元格(同一行)
  splitV(row, col, callback?: CallbackHandler) {
    if (this.getDisabledHandles(row, col).includes('splitH')) { return; }
    const { _rows, _cols } = markTable(this.rows);
    const curCell = this.rows[row][col];
    const _curCell = _rows[row][col];
    if (getSpanValue(curCell.colspan) > 1) {
      // 跨列单元格拆分：只影响这一行

      // 更新当前单元格宽度和colspan
      const initColspan = _curCell.colspan;
      curCell.colspan = getSpanValue(curCell.colspan) - Math.floor(initColspan / 2); // 尽可能平分：4=2+2 3=2+1
      let curCellStartCol = _curCell._startColIndex;
      const curCellEndCol = _curCell._startColIndex + curCell.colspan - 1;
      let curCellWidth = 0;
      while (curCellStartCol <= curCellEndCol) {
        const baseCell = _cols[curCellStartCol].find((i) => i.colspan === 1); // 找到colspan=1的单元格宽为基准 每一列的宽度记录
        curCellWidth += baseCell.width;
        curCellStartCol++;
      }
      curCell.width = curCellWidth;

      // 右侧新增单元格
      const addCellColspan = initColspan - curCell.colspan;
      let addCellStartCol = curCellEndCol + 1;
      const addCellEndCol = addCellStartCol + addCellColspan - 1;
      let addCellWidth = 0;
      while (addCellStartCol <= addCellEndCol) {
        const baseCell = _cols[addCellStartCol].find((i) => i.colspan === 1);
        addCellWidth += baseCell.width;
        addCellStartCol++;
      }

      this.rows[row].splice(col + 1, 0, {
        ...CELL_DEFAULT_CONFIG,
        width: addCellWidth,
        height: curCell.height,
        colspan: addCellColspan,
        rowspan: curCell.rowspan,
      });
    } else {
      // 非跨列（colsspan=1）单元格拆分：影响这一列
      _rows.forEach((rowData, rowIndex) => {
        if (rowIndex === row) {
          // 当前行当前列向右加1列
          curCell.width /= 2;
          this.rows[row].splice(col + 1, 0, {
            ...CELL_DEFAULT_CONFIG,
            width: curCell.width,
            height: curCell.height,
            rowspan: curCell.rowspan,
          });
        } else {
          // 找到每一行的列范围在在当前(一行只有一个)
          const _colIndex = rowData.findIndex((item) =>
            getCellCross(
              item._startColIndex,
              item._endColIndex,
              _curCell._startColIndex,
              _curCell._endColIndex
            )
          );
          if (_colIndex > -1) {
            const cell = this.rows[rowIndex][_colIndex];
            cell.colspan = getSpanValue(cell.colspan) + 1;
          }
        }
      });
    }

    const resultData = {
      rows: this.rows,
      rowIndex: row,
      colIndex: col,
      disabledHandles: this.getDisabledHandles(row, col),
    };
    callback?.(resultData);
    this.onUpdate?.(resultData);
    return resultData;
  }

  // splitH 垂直拆分单元格(同一列)
  splitH(row, col, callback?: CallbackHandler) {
    if (this.getDisabledHandles(row, col).includes('splitV')) { return; }
    let { _rows } = markTable(this.rows);
    let _curCell = _rows[row][col];
    let curCell = this.rows[row][col];
    if (getSpanValue(curCell.rowspan) > 1) {
      // 跨行单元格拆分
      // 更新当前单元格高度和rowspan
      const initRowspan = _curCell.rowspan;
      curCell.rowspan = getSpanValue(curCell.rowspan) - Math.floor(initRowspan / 2); // 尽可能平分：4=2+2 3=2+1
      let curCellStartRow = _curCell._startRowIndex;
      const curCellEndRow = _curCell._startRowIndex + curCell.rowspan - 1;
      let curCellHeight = 0;
      while (curCellStartRow <= curCellEndRow) {
        const baseCell = _rows[curCellStartRow].find((i) => i.rowspan === 1); // 找到rowspan=1的单元格宽为基准 每一行的高度
        curCellHeight += baseCell.height;
        curCellStartRow++;
      }
      curCell.height = curCellHeight;
      // 下方新增单元格
      const addCellRowspan = initRowspan - curCell.rowspan;
      let addCellStartRow = curCellEndRow + 1;
      const addCellEndRow = addCellStartRow + addCellRowspan - 1;
      let addCellHeight = 0;
      while (addCellStartRow <= addCellEndRow) {
        const baseCell = _rows[addCellStartRow].find((i) => i.rowspan === 1);
        addCellHeight += baseCell.height;
        addCellStartRow++;
      }

      const targetCellrow = row + curCell.rowspan; // 待加入的目标行index
      // 尝试寻找下一行目标位置右侧第一个[定位插入index]
      let targetCellCol = _rows[targetCellrow].findIndex(
        (item) => item._startColIndex > _curCell._endColIndex
      );
      if (targetCellCol === -1) {
        // 下一行目标位置左侧最后一个
        _rows[targetCellrow].forEach((item, index) => {
          if (item._endColIndex < _curCell._startColIndex) {
            targetCellCol = index;
          }
        });
        // 右侧无，可push
        this.rows[targetCellrow].splice(targetCellCol + 1, 0, {
          ...CELL_DEFAULT_CONFIG,
          rowspan: addCellRowspan,
          colspan: curCell.colspan,
          width: curCell.width,
          height: addCellHeight
        });
      } else {
        this.rows[targetCellrow].splice(targetCellCol, 0, {
          ...CELL_DEFAULT_CONFIG,
          rowspan: addCellRowspan,
          colspan: curCell.colspan,
          width: curCell.width,
          height: addCellHeight
        });
      }
    } else {
      // 非跨行单元格拆分
      // 当前列当前行向下加1行
      curCell.height /= 2;
      this.rows.splice(
        row + 1,
        0,
        Array.from({ length: 1 }, () => ({
          ...CELL_DEFAULT_CONFIG,
          colspan: curCell.colspan,
          width: curCell.width,
          height: curCell.height,
        }))
      );
      // 其他列入侵到当前行rowspan++
      _rows.forEach((item, rowIndex) => {
        item.forEach((i, colIndex) => {
          if (rowIndex !== row || colIndex !== col) {
            let offset = getCellCross(
              i._startRowIndex,
              i._endRowIndex,
              _curCell._startRowIndex,
              _curCell._endRowIndex
            );
            if (offset) {
              const cell = this.rows[i._rowIndex][i._colIndex];
              cell.rowspan = getSpanValue(cell.rowspan) + 1;
            }
          }
        });
      });
    }

    const resultData = {
      rows: this.rows,
      rowIndex: row,
      colIndex: col,
      disabledHandles: this.getDisabledHandles(row, col),
    };
    callback?.(resultData);
    this.onUpdate?.(resultData);
    return resultData;
  }

  // leftMerge 向左合并单元格
  leftMerge(rowIndex: number, colIndex: number, callback?: CallbackHandler) {
    if (this.getDisabledHandles(rowIndex, colIndex).includes('leftMerge')) { return; }
    const leftCell = findLeftRightCell(this.rows, rowIndex, colIndex, -1);

    if (leftCell) {
      const rightCell = this.rows[rowIndex][colIndex];
      // 设置左边单元格colspan、width
      leftCell.colspan = getSpanValue(leftCell.colspan) + getSpanValue(rightCell.colspan);
      leftCell.width += rightCell.width;
      // 删除当前单元格
      this.rows[rowIndex].splice(colIndex, 1);
      const resultData = {
        rows: this.rows,
        rowIndex,
        colIndex: colIndex - 1,
        disabledHandles: this.getDisabledHandles(rowIndex, colIndex - 1),
      };
      callback?.(resultData);
      this.onUpdate?.(resultData);
      return resultData;
    }
  }

  // rightMerge 向右合并单元格
  rightMerge(rowIndex: number, colIndex: number, callback?: CallbackHandler) {
    if (this.getDisabledHandles(rowIndex, colIndex).includes('rightMerge')) { return; }
    const rightCell = findLeftRightCell(this.rows, rowIndex, colIndex, 1);

    if (rightCell) {
      const leftCell = this.rows[rowIndex][colIndex];
      // 设置左边单元格colspan
      leftCell.colspan = getSpanValue(leftCell.colspan) + getSpanValue(rightCell.colspan);
      leftCell.width += rightCell.width;
      // 删除右边单元格
      this.rows[rowIndex].splice(colIndex + 1, 1);
      const resultData = {
        rows: this.rows,
        rowIndex,
        colIndex,
        disabledHandles: this.getDisabledHandles(rowIndex, colIndex),
      };
      callback?.(resultData);
      this.onUpdate?.(resultData);
      return resultData;
    }
  }

  // topMerge 向上合并单元格
  topMerge(rowIndex: number, colIndex: number, callback?: CallbackHandler) {
    if (this.getDisabledHandles(rowIndex, colIndex).includes('topMerge')) { return; }
    const target = findTopBottomCell(this.rows, rowIndex, colIndex, -1);
    if (target) {
      const { targetCell: topCell, rowIndex: topRowIndex, colIndex: topColIndex } = target;
      const bottomRowIndex = rowIndex;
      const bottomColIndex = colIndex;
      const bottomCell = this.rows[bottomRowIndex][bottomColIndex];
      if (this.rows[bottomRowIndex].length === 1) {
        // 删除整行
        this.delRow(bottomRowIndex, bottomColIndex);
      } else {
        // 设置当上边单元格rowspan
        topCell.rowspan = getSpanValue(topCell.rowspan) + getSpanValue(bottomCell.rowspan);
        topCell.height += bottomCell.height;
        this.rows[bottomRowIndex].splice(bottomColIndex, 1);
      }
      const resultData = {
        rows: this.rows,
        rowIndex: topRowIndex,
        colIndex: topColIndex,
        disabledHandles: this.getDisabledHandles(topRowIndex, topColIndex),
      };
      callback?.(resultData);
      this.onUpdate?.(resultData);
      return resultData;
    }
  }

  // bottomMerge 向下合并单元格
  bottomMerge(rowIndex: number, colIndex: number, callback?: CallbackHandler) {
    if (this.getDisabledHandles(rowIndex, colIndex).includes('bottomMerge')) { return; }
    const target = findTopBottomCell(this.rows, rowIndex, colIndex, 1);
    if (target) {
      const { targetCell: bottomCell, rowIndex: bottomRowIndex, colIndex: bottomColIndex } = target;
      const topCell = this.rows[rowIndex][colIndex];
      const topRowIndex = rowIndex;
      const topColIndex = colIndex;
      if (this.rows[bottomRowIndex].length === 1) {
        // 删除一行
        this.delRow(bottomRowIndex, bottomColIndex);
      } else {
        // 设置当上边单元格rowspan
        topCell.rowspan = getSpanValue(topCell.rowspan) + getSpanValue(bottomCell.rowspan);
        topCell.height += bottomCell.height;
        // 删除下方单元格
        this.rows[bottomRowIndex].splice(bottomColIndex, 1);
      }
      const resultData = {
        rows: this.rows,
        rowIndex: topRowIndex,
        colIndex: topColIndex,
        disabledHandles: this.getDisabledHandles(topRowIndex, topColIndex),
      };
      callback?.(resultData);
      this.onUpdate?.(resultData);
      return resultData;
    }
  }
}

export default TableUtils;
