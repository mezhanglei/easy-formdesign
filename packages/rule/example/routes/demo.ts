import loadable from "./loadable";

export const DemoRoutes = [
  {
    path: "/",
    component: loadable(() => import('../demo/index'))
  }
];
