import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { createSetupExtend } from './vueSetupExtend'
import { createCompression } from './compression'

export function createVitePlugins(viteEnv, isBuild = false) {
  const vitePlugins = [vue(), vueJsx()]
  vitePlugins.push(createSetupExtend())
  isBuild && vitePlugins.push(...createCompression(viteEnv))
  return vitePlugins
}
