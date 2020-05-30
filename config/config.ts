import { defineConfig } from 'umi';
import routers from './routers.config';


export default defineConfig({
    nodeModulesTransform: {
        type: 'none',
    },
    dva: { immer: true },
    routes: routers
});
