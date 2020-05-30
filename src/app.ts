export const render = (oldRender: any) => {
    //覆盖render,可用于权限校验
    return oldRender();
}