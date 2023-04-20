let requestData = {
  g1_temp: '121°C',
  g1_weight: '0.64m 222t',
  g1_per: 0.035555555555555556,
  g1_valve: '1',
  g2_temp: '121°C',
  g2_weight: '0.64m 222t',
  g2_per: 0.035555555555555556,
  g2_valve: '2',
  g3_temp: '121°C',
  g3_weight: '0.64m 222t',
  g3_per: 0.035555555555555556,
  g3_valve: '3',
  g4_temp: '121°C',
  g4_weight: '0.64m 222t',
  g4_per: 0.035555555555555556,
  g4_valve: '0',
  g5_temp: '121°C',
  g5_weight: '0.64m 222t',
  g5_per: 0.035555555555555556,
  g5_valve: '0',
  g6_temp: '121°C',
  g6_weight: '0.64m 222t',
  g6_per: 0.035555555555555556,
  g6_valve: '0',
  g7_temp: '121°C',
  g7_weight: '0.64m 222t',
  g7_per: 0.035555555555555556,
  g7_valve: '0',
  g8_temp: '121°C',
  g8_weight: '0.64m 222t',
  g8_per: 0.035555555555555556,
  g8_valve: '0',
  g9_temp: '121°C',
  g9_weight: '0.64m 222t',
  g9_per: 0.035555555555555556,
  g9_valve: '0',
  g10_temp: '121°C',
  g10_weight: '0.64m 222t',
  g10_per: 0.035555555555555556,
  g10_valve: '0',
  g11_temp: '121°C',
  g11_weight: '0.64m 222t',
  g11_per: 0.035555555555555556,
  g11_valve: '0',
  g12_temp: '121°C',
  g12_weight: '0.64m 222t',
  g12_per: 0.035555555555555556,
  g12_valve: '0',
  g13_temp: '121°C',
  g13_weight: '0.64m 222t',
  g13_per: 0.035555555555555556,
  g13_valve: '0',
  g14_temp: '121°C',
  g14_weight: '0.64m 222t',
  g14_per: 0.035555555555555556,
  g14_valve: '0',
  g15_temp: '121°C',
  g15_weight: '0.64m 222t',
  g15_per: 0.035555555555555556,
  g15_valve: '0',
  g16_temp: '121°C',
  g16_weight: '0.64m 222t',
  g16_per: 0.035555555555555556,
  g16_valve: '0',
  g17_temp: '121°C',
  g17_weight: '0.64m 222t',
  g17_per: 0.035555555555555556,
  g17_valve: '0',
  g18_temp: '121°C',
  g18_weight: '0.64m 222t',
  g18_per: 0.035555555555555556,
  g18_valve: '0',
  g19_temp: '121°C',
  g19_weight: '0.64m 222t',
  g19_per: 0.035555555555555556,
  g19_valve: '0',
  g20_temp: '121°C',
  g20_weight: '0.64m 222t',
  g20_per: 0.035555555555555556,
  g20_valve: '0',
  g21_temp: '121°C',
  g21_weight: '0.64m 222t',
  g21_per: 0.035555555555555556,
  g21_valve: '0',
  g22_temp: '121°C',
  g22_weight: '0.64m 222t',
  g22_per: 0.035555555555555556,
  g22_valve: '0',
  g23_temp: '121°C',
  g23_weight: '0.64m 222t',
  g23_per: 0.035555555555555556,
  g23_valve: '0',
  g24_temp: '121°C',
  g24_weight: '0.64m 222t',
  g24_per: 0.035555555555555556,
  g24_valve: '0',
  g25_temp: '121°C',
  g25_weight: '0.64m 222t',
  g25_per: 0.035555555555555556,
  g25_valve: '0',
  pump_1: '0',
  pump_2: '1',
  now: '2023-04-07 10:00:00',
}

for (let key in requestData) {
  if (key.indexOf('_per') !== -1) {
    /* 处理 液位进度 */
    let keyPre = key.replace('_per', '')
    requestData[`${keyPre}_progress`] = `${(requestData[key] * 100).toFixed(2)}%`
  } else if (key.indexOf('_valve') !== -1 || key.indexOf('pump_') !== -1) {
    /* 处理 阀门 || 泵 开关 */
    switch (requestData[key]) {
      case '0':
        // 开 (绿色)
        requestData[key] = '#00ff00'
        break
      case '1':
        // 关（灰色）
        requestData[key] = '#333333'
        break
      case '2':
        // 离线（蓝色）
        requestData[key] = '#0000ff'
        break
      case '3':
        // 异常（红色）
        requestData[key] = '#ff0000'
        break
    }
  }
}
export default requestData
