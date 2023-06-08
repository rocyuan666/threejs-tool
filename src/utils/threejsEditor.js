/**
 * ThreeJS 编辑器
 * version v1.0.0
 */
import TWEEN from '@tweenjs/tween.js'
import Stats from 'stats.js'
import dat from 'dat.gui'
import FileSaver from 'file-saver'
import * as THREE from 'three'
import { FontLoader } from 'three/addons/loaders/FontLoader'
import { SVGLoader } from 'three/addons/loaders/SVGLoader'
import { OrbitControls } from 'three/addons/controls/OrbitControls'
import { TransformControls } from 'three/addons/controls/TransformControls'
import { TextGeometry } from 'three/addons/geometries/TextGeometry'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader'

class ThreejsEditor {
  // 版本
  version = 'v1.0.0'
  // 内部变量
  renderer = null
  camera = null
  scene = null
  stats = null
  orbit = null
  transformControl = null
  gui = null
  datGui = null
  guiController = null
  guiEnabled = true
  raycaster = null
  tween = null
  INTERSECTED = null
  divMain = null
  isMove = null
  isMouseDown = false
  mouseMoveIndex = 0
  targetPosition = null

  init(el) {
    this.divMain = el
    this.initRender()
    this.initScene()
    this.initCamera()
    this.initLight()
    this.initModel()
    this.initControls()
    this.initStats()
    this.initGui()
    this.initRaycaster()
    requestAnimationFrame(this.animate.bind(this))
    window.onresize = this.onWindowResize.bind(this)
  }

  // 弧度角度换算
  getRad(deg) {
    return (Math.PI * deg) / 180
  }

  getDeg(rad) {
    let deg = (rad * 180) / Math.PI
    deg = deg % 360
    if (deg < 0) {
      deg += 360
    }
    return deg
  }

  initRender() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.VSMShadowMap
    this.renderer.outputEncoding = THREE.sRGBEncoding
    this.renderer.setPixelRatio(window.devicePixelRatio)
    /*
      BasicShadowMap 能够给出没有经过过滤的阴影映射 —— 速度最快，但质量最差。
      PCFShadowMap 为默认值，使用Percentage-Closer Filtering (PCF)算法来过滤阴影映射。
      PCFSoftShadowMap 使用Percentage-Closer Soft Shadows (PCSS)算法来过滤阴影映射。
      VSMShadowMap 使用Variance Shadow Map (VSM)算法来过滤阴影映射。当使用VSMShadowMap时，所有阴影接收者也将会投射阴影。
    */
    this.renderer.setClearColor('#333', 0) //设置背景颜色
    this.renderer.setSize(this.divMain.offsetWidth, this.divMain.offsetHeight)
    this.divMain.appendChild(this.renderer.domElement)
  }

  initCamera() {
    this.camera = new THREE.PerspectiveCamera(
      30,
      this.divMain.offsetWidth / this.divMain.offsetHeight,
      0.1,
      1000
    )
    this.camera.position.set(0, 20, 60)
  }

  initScene() {
    this.scene = new THREE.Scene()
    this.scene.fog = new THREE.FogExp2('#ccc', 0.005)
    // this.scene.fog = new THREE.Fog('#ccc', 20, 100)
    // SKYBOX/FOG
    // const skyBoxGeometry = new THREE.CubeGeometry(200, 200, 200)
    // const skyBoxMaterial = new THREE.MeshBasicMaterial({ color: '#367EE3', side: THREE.BackSide })
    // const skyBox = new THREE.Mesh(skyBoxGeometry, skyBoxMaterial)
    // this.scene.add(skyBox)
    let urls = [
      './3d_assets/img/skybox_RT_s.jpg', // right
      './3d_assets/img/skybox_LF_s.jpg', // left
      './3d_assets/img/skybox_UP_s.jpg', // top
      './3d_assets/img/skybox_DN_s.jpg', // bottom
      './3d_assets/img/skybox_BK_s.jpg', // back
      './3d_assets/img/skybox_FR_s.jpg', // front
    ]
    let skyboxCubemap = new THREE.CubeTextureLoader().load(urls)
    this.scene.background = skyboxCubemap
    // 坐标轴辅助
    let axes = new THREE.AxesHelper(50)
    this.scene.add(axes)
    // 网格
    let gridHelper = new THREE.GridHelper(100, 100, 0x0000ff, '#111')
    this.scene.add(gridHelper)
  }

  initLight() {
    this.scene.add(new THREE.AmbientLight(0x404040))
    let light = new THREE.DirectionalLight(0xffffff)
    light.position.set(0, 50, 50)
    light.castShadow = true
    // light.shadowCameraVisible = true;
    this.scene.add(light)
    let helper = new THREE.DirectionalLightHelper(light, 5)
    this.scene.add(helper)
    light.shadow.camera.near = 0.5 // default
    light.shadow.camera.far = 500 // default
    light.shadow.camera.top = 100 // default
    light.shadow.camera.right = 100 // default
    light.shadow.camera.bottom = -100 // default
    light.shadow.camera.left = -100 // default
    // addObj(new THREE.DodecahedronGeometry(1, 2), {x:0,y:50,z:50}, 'red');
    // LIGHT
    light = new THREE.PointLight(0xffffff, 0.3)
    light.position.set(0, 50, -50)
    light.castShadow = false
    // light.shadowCameraVisible = true;
    this.scene.add(light)
    let pointLightHelper = new THREE.PointLightHelper(light, 1)
    this.scene.add(pointLightHelper)
  }

  initModel() {
    // 一个立方体
    this.addObj(
      new THREE.BoxBufferGeometry(50, 0.4, 50),
      { x: 0, y: 0.2, z: 0 },
      '#363',
      './3d_assets/texture/texture02.jpg'
    )
    let i = 0
    for (let x = -20; x <= 20; x += 5) {
      for (let y = -20; y <= 20; y += 5) {
        let h = 3 + Math.random() * 10
        let geometry = new THREE.BoxBufferGeometry(4, h, 4)
        geometry.translate(0, h / 2, 0)

        this.addObj(geometry, { x: x, y: 0, z: y }, null, './3d_assets/texture/texture01.jpg')

        i++
        let spritey = this.addMarker(' #' + i + '号 ')
        spritey.position.set(x, h, y)
      }
    }
    this.addText('Hello World!')
    this.addSvg('./3d_assets/models/svg/threejs.svg')
  }

  // 初始化Stats
  initStats() {
    this.stats = new Stats()
    this.stats.dom.style.position = 'absolute'
    this.stats.dom.style.left = '0px'
    this.stats.dom.style.top = '0px'
    this.divMain.appendChild(this.stats.dom)
  }

  // 初始化控制
  initControls() {
    const that = this
    this.orbit = new OrbitControls(this.camera, this.renderer.domElement)
    // 如果使用animate方法时，将此函数删除
    //orbit.addEventListener( 'change', render );
    // 使动画循环使用时阻尼或自转 意思是否有惯性
    this.orbit.enableDamping = true
    //动态阻尼系数 就是鼠标拖拽旋转灵敏度
    //orbit.dampingFactor = 0.25;
    //是否可以缩放
    this.orbit.enableZoom = true
    //是否自动旋转
    this.orbit.autoRotate = true
    this.orbit.autoRotateSpeed = 0.3
    //设置相机距离原点的最远距离
    this.orbit.minDistance = 1
    //设置相机距离原点的最远距离
    this.orbit.maxDistance = 150
    //是否开启右键拖拽
    this.orbit.enablePan = false

    this.orbit.minPolarAngle = (45 * Math.PI) / 180
    this.orbit.maxPolarAngle = (80 * Math.PI) / 180

    // 变换控制
    this.transformControl = new TransformControls(this.camera, this.renderer.domElement)
    this.transformControl.size = 0.5
    this.transformControl.addEventListener('change', this.render.bind(this))
    this.transformControl.addEventListener('dragging-changed', (event) => {
      this.orbit.enabled = !event.value
    })
    this.scene.add(this.transformControl)

    // Hiding transform situation is a little in a mess :()
    this.transformControl.addEventListener('change', () => {})

    this.transformControl.addEventListener('mouseDown', () => {
      this.isMove = true
    })

    this.transformControl.addEventListener('mouseUp', () => {
      this.isMove = false
    })

    this.transformControl.addEventListener('objectChange', () => {
      if (!this.INTERSECTED) return

      this.guiEnabled = false
      this.guiController.positionX.setValue(this.INTERSECTED.position.x)
      this.guiController.positionY.setValue(this.INTERSECTED.position.y)
      this.guiController.positionZ.setValue(this.INTERSECTED.position.z)
      this.guiController.rotationX.setValue(this.getDeg(this.INTERSECTED.rotation._x))
      this.guiController.rotationY.setValue(this.getDeg(this.INTERSECTED.rotation._y))
      this.guiController.rotationZ.setValue(this.getDeg(this.INTERSECTED.rotation._z))
      this.guiController.scaleX.setValue(this.INTERSECTED.scale.x)
      this.guiController.scaleY.setValue(this.INTERSECTED.scale.y)
      this.guiController.scaleZ.setValue(this.INTERSECTED.scale.z)
      this.guiController.scale.setValue(
        Math.min(this.INTERSECTED.scale.x, this.INTERSECTED.scale.y, this.INTERSECTED.scale.z)
      )
      this.guiEnabled = true

      if (this.INTERSECTED.userData['type'] == 'TubeBox') {
        this.updateTube()
      }
    })
    // 快捷键 保存 加载 导出 清空
    window.addEventListener('keydown', function (e) {
      if (e.ctrlKey && e.key === 's') {
        that.save()
        e.preventDefault()
      } else if (e.ctrlKey && e.key === 'l') {
        that.load()
        e.preventDefault()
      } else if (e.ctrlKey && e.key === 'e') {
        that.exportJson()
        e.preventDefault()
      } else if (e.ctrlKey && e.key === 'r') {
        that.clear()
        e.preventDefault()
      }
    })
  }

  // 初始化自定义参数
  initGui() {
    const that = this
    this.guiController = {}
    //声明一个保存需求修改的相关数据的对象
    this.gui = {
      fogColor: '#ccc',
      fogDensity: 0.005,
      autoRotate: true,
      curColor: '#fff',
      castShadow: true,
      receiveShadow: true,
      opEnabled: true,
      opModel: 'translate', // translate  rotate  scale
      opX: true,
      opY: true,
      opZ: true,
      positionX: 1,
      positionY: 1,
      positionZ: 1,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0,
      scale: 1,
      scaleX: 1,
      scaleY: 1,
      scaleZ: 1,
      textureUrl: '',
      textureRepeatX: 3,
      textureRepeatY: 3,
      bumpScale: 0.2,
      shininess: 30,
      opacity: 1,
      // 绑定信息
      bind_name: '',
      bind_visible: '',
      bind_color: '',
      bind_positionX: '',
      bind_positionY: '',
      bind_positionZ: '',
      bind_rotationX: '',
      bind_rotationY: '',
      bind_rotationZ: '',
      bind_scaleX: '',
      bind_scaleY: '',
      bind_scaleZ: '',
      bind_opacity: '',
      bind_value: '',
      bind_can_select: '',

      // 拷贝
      copy: () => {
        if (!this.INTERSECTED) {
          return
        }

        if (this.INTERSECTED.userData.type == 'TubeBox') {
          return
        }

        let obj = null
        if (this.INTERSECTED.type != 'Mesh') {
          obj = this.INTERSECTED.clone()
          this.scene.add(obj)
          this.selectObj(obj)
          return
        }

        let geometry = this.INTERSECTED.geometry.clone()
        let material = null
        if (this.INTERSECTED.material instanceof Array) {
          material = []
          for (let k in this.INTERSECTED.material) {
            material.push(this.INTERSECTED.material[k].clone())
          }
        } else if (this.INTERSECTED.material) {
          material = this.INTERSECTED.material.clone()
        }
        obj = new THREE.Mesh(geometry, material)
        obj.castShadow = this.INTERSECTED.castShadow
        obj.receiveShadow = this.INTERSECTED.receiveShadow

        obj.userData = JSON.parse(JSON.stringify(this.INTERSECTED.userData))

        obj.position.set(
          this.INTERSECTED.position.x + 2,
          this.INTERSECTED.position.y,
          this.INTERSECTED.position.z
        )
        obj.rotation.set(
          this.INTERSECTED.rotation.x,
          this.INTERSECTED.rotation.y,
          this.INTERSECTED.rotation.z
        )
        obj.scale.set(this.INTERSECTED.scale.x, this.INTERSECTED.scale.y, this.INTERSECTED.scale.z)

        if (obj.userData.type == 'Tube') {
          this.setTubeBox(obj)
        }

        this.scene.add(obj)

        // 选中
        if (
          this.INTERSECTED.material &&
          this.INTERSECTED.material instanceof THREE.MeshPhongMaterial
        ) {
          obj.material.emissive.setHex(this.INTERSECTED.currentHex)
        }
        this.selectObj(obj)
      },

      // 删除
      del: () => {
        if (!this.INTERSECTED) {
          return
        }

        if (!window.confirm('确认删除？')) {
          return
        }

        this.scene.remove(this.INTERSECTED)
        this.INTERSECTED = null
        this.transformControl.detach(this.transformControl.object)
      },
    }
    this.datGui = new dat.GUI()
    // 将设置属性添加到gui当中，gui.add(对象，属性，最小值，最大值）
    let f1 = this.datGui.addFolder('基础')
    this.guiController.fogColor = f1
      .addColor(this.gui, 'fogColor')
      .name('雾气颜色')
      .onChange((value) => {
        if (!this.guiEnabled) return
        this.scene.fog.color.set(value)
      })
    this.guiController.fogDensity = f1
      .add(this.gui, 'fogDensity', 0, 0.04)
      .name('雾气强度')
      .onChange((value) => {
        if (!this.guiEnabled) return
        this.scene.fog.density = value
      })

    // 自动旋转
    this.guiController.autoRotate = f1
      .add(this.gui, 'autoRotate')
      .name('自动旋转')
      .onChange((value) => {
        if (!this.guiEnabled) return
        if (this.INTERSECTED) return
        this.orbit.autoRotate = value
      })

    // f1.open();

    let f2 = this.datGui.addFolder('选中项')
    f2.add(this.gui, 'opEnabled')
      .listen()
      .name('操作启用')
      .onChange((value) => {
        this.transformControl.enabled = value
      })
    let modelType = {
      移动: 'translate',
      旋转: 'rotate',
      缩放: 'scale',
    }
    f2.add(this.gui, 'opModel', modelType)
      .name('操作模式')
      .onChange((value) => {
        this.transformControl.setMode(value)
      })
    f2.add(this.gui, 'opX')
      .name('X轴启用')
      .onChange((value) => {
        this.transformControl.showX = value
      })
    f2.add(this.gui, 'opY')
      .name('Y轴启用')
      .onChange((value) => {
        this.transformControl.showY = value
      })
    f2.add(this.gui, 'opZ')
      .name('Z轴启用')
      .onChange((value) => {
        this.transformControl.showY = value
      })

    // 阴影
    this.guiController.castShadow = f2
      .add(this.gui, 'castShadow')
      .name('产生阴影')
      .onChange((value) => {
        if (this.INTERSECTED && this.guiEnabled) {
          this.INTERSECTED.castShadow = value
        }
      })
    this.guiController.receiveShadow = f2
      .add(this.gui, 'receiveShadow')
      .name('接受阴影')
      .onChange((value) => {
        if (this.INTERSECTED && this.guiEnabled) {
          this.INTERSECTED.receiveShadow = value
        }
      })

    // 颜色
    this.guiController.curColor = f2
      .addColor(this.gui, 'curColor')
      .name('颜色')
      .onChange((value) => {
        if (
          this.INTERSECTED &&
          this.guiEnabled &&
          this.INTERSECTED.material &&
          this.INTERSECTED.material instanceof THREE.MeshPhongMaterial
        ) {
          this.INTERSECTED.material.color.set(value)
          this.INTERSECTED.userData['materialParams']['color'] = value
        }
      })

    // 位置
    let positionFn = () => {
      if (!this.INTERSECTED || !this.guiEnabled) return
      this.INTERSECTED.position.set(this.gui.positionX, this.gui.positionY, this.gui.positionZ)
    }
    this.guiController.positionX = f2.add(this.gui, 'positionX').name('位置X').onChange(positionFn)
    this.guiController.positionY = f2.add(this.gui, 'positionY').name('位置Y').onChange(positionFn)
    this.guiController.positionZ = f2.add(this.gui, 'positionZ').name('位置Z').onChange(positionFn)

    // 角度
    let rotationFn = () => {
      if (!this.INTERSECTED || !this.guiEnabled) return
      this.INTERSECTED.rotation.set(
        this.getRad(this.gui.rotationX),
        this.getRad(this.gui.rotationY),
        this.getRad(this.gui.rotationZ),
        'XYZ'
      )
    }
    this.guiController.rotationX = f2
      .add(this.gui, 'rotationX', 0, 360, 5)
      .name('旋转X')
      .onChange(rotationFn)
    this.guiController.rotationY = f2
      .add(this.gui, 'rotationY', 0, 360, 5)
      .name('旋转Y')
      .onChange(rotationFn)
    this.guiController.rotationZ = f2
      .add(this.gui, 'rotationZ', 0, 360, 5)
      .name('旋转Z')
      .onChange(rotationFn)

    // 缩放
    this.guiController.scale = f2
      .add(this.gui, 'scale', 0)
      .name('缩放')
      .onChange((value) => {
        if (!this.INTERSECTED || !this.guiEnabled) return
        this.INTERSECTED.scale.set(value, value, value)

        this.guiEnabled = false
        this.guiController.scaleX.setValue(value)
        this.guiController.scaleY.setValue(value)
        this.guiController.scaleZ.setValue(value)
        this.guiEnabled = true
      })
    let scaleFn = () => {
      if (!this.INTERSECTED || !this.guiEnabled) return
      this.INTERSECTED.scale.set(this.gui.scaleX, this.gui.scaleY, this.gui.scaleZ)
    }
    this.guiController.scaleX = f2.add(this.gui, 'scaleX').name('缩放X').onChange(scaleFn)
    this.guiController.scaleY = f2.add(this.gui, 'scaleY').name('缩放Y').onChange(scaleFn)
    this.guiController.scaleZ = f2.add(this.gui, 'scaleZ').name('缩放Z').onChange(scaleFn)

    // 材质
    let textureType = {
      empty: '',
      texture01: './3d_assets/texture/texture01.jpg',
      texture02: './3d_assets/texture/texture02.jpg',
      texture03: './3d_assets/texture/texture03.jpg',
    }
    this.guiController.textureUrl = f2
      .add(this.gui, 'textureUrl', textureType)
      .name('材质图片')
      .onChange((value) => {
        if (!this.INTERSECTED || !this.guiEnabled) return
        if (value == '') {
          if (this.INTERSECTED.material.map) {
            this.INTERSECTED.material.map.repeat.set(0, 0)
          }
          this.INTERSECTED.userData['textureRepeatX'] = 0
          this.INTERSECTED.userData['textureRepeatY'] = 0
        } else {
          const texture = new THREE.TextureLoader().load(value)
          texture.wrapS = THREE.RepeatWrapping
          texture.wrapT = THREE.RepeatWrapping
          texture.repeat.set(this.gui.textureRepeatX, this.gui.textureRepeatY)

          this.INTERSECTED.material.map = texture
          this.INTERSECTED.material.bumpMap = texture
        }
        this.INTERSECTED.userData['textureUrl'] = value
      })
    this.guiController.textureRepeatX = f2
      .add(this.gui, 'textureRepeatX')
      .name('材质缩放X')
      .onChange((value) => {
        if (!this.INTERSECTED || !this.guiEnabled) return
        if (this.INTERSECTED.material.map) {
          if (this.gui.textureUrl == '') {
            this.INTERSECTED.material.map.repeat.set(0, 0)
          } else {
            this.INTERSECTED.material.map.repeat.set(
              this.gui.textureRepeatX,
              this.gui.textureRepeatY
            )
          }
        }
        this.INTERSECTED.userData['textureRepeatX'] = value
      })
    this.guiController.textureRepeatY = f2
      .add(this.gui, 'textureRepeatY')
      .name('材质缩放Y')
      .onChange((value) => {
        if (!this.INTERSECTED || !this.guiEnabled) return
        if (this.INTERSECTED.material.map) {
          if (this.gui.textureUrl == '') {
            this.INTERSECTED.material.map.repeat.set(0, 0)
          } else {
            this.INTERSECTED.material.map.repeat.set(
              this.gui.textureRepeatX,
              this.gui.textureRepeatY
            )
          }
        }
        this.INTERSECTED.userData['textureRepeatY'] = value
      })

    // 材质凹凸
    this.guiController.bumpScale = f2
      .add(this.gui, 'bumpScale', 0, 1)
      .name('材质凹凸')
      .onChange((value) => {
        if (!this.INTERSECTED || !this.guiEnabled || !this.INTERSECTED.material) return
        this.INTERSECTED.material.bumpScale = value
        this.INTERSECTED.userData['materialParams']['bumpScale'] = value
      })

    // 高亮
    this.guiController.shininess = f2
      .add(this.gui, 'shininess', 0, 100)
      .name('高亮')
      .onChange((value) => {
        if (!this.INTERSECTED || !this.guiEnabled || !this.INTERSECTED.material) return
        this.INTERSECTED.material.shininess = value
        this.INTERSECTED.userData['materialParams']['shininess'] = value
      })

    // 透明
    this.guiController.opacity = f2
      .add(this.gui, 'opacity', 0, 1)
      .name('透明度')
      .onChange((value) => {
        if (!this.INTERSECTED || !this.guiEnabled || !this.INTERSECTED.material) return
        this.INTERSECTED.material.opacity = value
        this.INTERSECTED.material.transparent = value != 1
        this.INTERSECTED.userData['materialParams']['opacity'] = value
      })

    // 3D对象操作
    f2.add(this.gui, 'copy').name('复制3D对象')
    f2.add(this.gui, 'del').name('删除3D对象')

    // 绑定
    let f3 = this.datGui.addFolder('绑定')
    let saveBind = function (value) {
      if (!that.INTERSECTED || !that.guiEnabled) return
      if (!that.INTERSECTED.userData['bind']) {
        that.INTERSECTED.userData['bind'] = {}
      }
      let k = this.property.replace('bind_', '')
      if (value == '') {
        delete that.INTERSECTED.userData['bind'][k]
      } else {
        that.INTERSECTED.userData['bind'][k] = value
      }
    }

    this.guiController.bind_name = f3
      .add(this.gui, 'bind_name')
      .name('名称')
      .onFinishChange(saveBind)
    this.guiController.bind_visible = f3
      .add(this.gui, 'bind_visible')
      .name('是否可见')
      .onFinishChange(saveBind)
    this.guiController.bind_color = f3
      .add(this.gui, 'bind_color')
      .name('颜色')
      .onFinishChange(saveBind)
    this.guiController.bind_positionX = f3
      .add(this.gui, 'bind_positionX')
      .name('位置X')
      .onFinishChange(saveBind)
    this.guiController.bind_positionY = f3
      .add(this.gui, 'bind_positionY')
      .name('位置Y')
      .onFinishChange(saveBind)
    this.guiController.bind_positionZ = f3
      .add(this.gui, 'bind_positionZ')
      .name('位置Z')
      .onFinishChange(saveBind)
    this.guiController.bind_rotationX = f3
      .add(this.gui, 'bind_rotationX')
      .name('旋转X')
      .onFinishChange(saveBind)
    this.guiController.bind_rotationY = f3
      .add(this.gui, 'bind_rotationY')
      .name('旋转Y')
      .onFinishChange(saveBind)
    this.guiController.bind_rotationZ = f3
      .add(this.gui, 'bind_rotationZ')
      .name('旋转Z')
      .onFinishChange(saveBind)
    this.guiController.bind_scaleX = f3
      .add(this.gui, 'bind_scaleX')
      .name('缩放X')
      .onFinishChange(saveBind)
    this.guiController.bind_scaleY = f3
      .add(this.gui, 'bind_scaleY')
      .name('缩放Y')
      .onFinishChange(saveBind)
    this.guiController.bind_scaleZ = f3
      .add(this.gui, 'bind_scaleZ')
      .name('缩放Z')
      .onFinishChange(saveBind)
    this.guiController.bind_opacity = f3
      .add(this.gui, 'bind_opacity')
      .name('透明度')
      .onFinishChange(saveBind)
    this.guiController.bind_value = f3
      .add(this.gui, 'bind_value')
      .name('显示值')
      .onFinishChange(saveBind)
    this.guiController.bind_can_select = f3
      .add(this.gui, 'bind_can_select')
      .name('允许选中')
      .onFinishChange(saveBind)
  }

  // 初始化鼠标点击
  initRaycaster() {
    this.raycaster = new THREE.Raycaster()
    this.divMain.addEventListener('mousedown', () => {
      if (this.isMove) return
      this.isMouseDown = true
      this.mouseMoveIndex = 0
    })
    document.addEventListener('mousemove', () => {
      this.isMouseDown = this.mouseMoveIndex++ == 0
    })
    this.divMain.addEventListener('mouseup', (event) => {
      if (this.INTERSECTED) {
        this.targetPosition = this.INTERSECTED.position.clone()
        if (this.INTERSECTED.userData['type'] == 'TubeBox') {
          this.targetPosition.set(
            this.targetPosition.x + this.INTERSECTED.parent.position.x,
            this.targetPosition.y + this.INTERSECTED.parent.position.y,
            this.targetPosition.z + this.INTERSECTED.parent.position.z
          )
        }
        this.animateCamera(this.orbit.target, this.targetPosition)
      }
      if (!this.isMouseDown) return
      this.isMouseDown = false
      event.preventDefault()
      let mouse = new THREE.Vector2()
      let objects = []
      mouse.x = ((event.clientX - 0) / this.divMain.offsetWidth) * 2 - 1
      mouse.y = -(event.clientY / this.divMain.offsetHeight) * 2 + 1

      this.raycaster.setFromCamera(mouse, this.camera)
      this.scene.children.forEach((child) => {
        if (!child.type) return
        if (!child.userData.type) return

        if (['Mesh', 'Scene', 'Sprite', 'Group'].includes(child.type)) {
          objects.push(child)
        }
      })

      const intersects = this.raycaster.intersectObjects(objects, true)
      if (intersects.length > 0) {
        let curObj = intersects[0].object
        const _TRUE = true
        while (_TRUE) {
          if (curObj.userData.type) {
            break
          }
          if (!curObj.parent) {
            break
          }
          if (!curObj.parent.parent) {
            break
          }
          curObj = curObj.parent
        }

        this.selectObj(curObj)
        this.orbit.autoRotate = false
      } else {
        if (this.INTERSECTED) {
          if (
            this.INTERSECTED.material &&
            this.INTERSECTED.material instanceof THREE.MeshPhongMaterial
          ) {
            this.INTERSECTED.material.emissive.setHex(this.INTERSECTED.currentHex)
          }
        }

        this.orbit.autoRotate = this.gui.autoRotate
        this.INTERSECTED = null
        this.transformControl.detach(this.transformControl.object)
      }
    })
  }

  // 选中3D对象
  selectObj(obj) {
    if (obj == this.INTERSECTED) {
      return
    }
    if (this.INTERSECTED) {
      if (
        this.INTERSECTED.material &&
        this.INTERSECTED.material instanceof THREE.MeshPhongMaterial
      ) {
        this.INTERSECTED.material.emissive.setHex(this.INTERSECTED.currentHex)
      }
    }

    // 高亮
    this.INTERSECTED = obj

    this.guiEnabled = false
    if (this.INTERSECTED.material && this.INTERSECTED.material instanceof THREE.MeshPhongMaterial) {
      this.guiController.curColor.setValue('#' + this.INTERSECTED.material.color.getHexString())
    }
    this.guiController.positionX.setValue(this.INTERSECTED.position.x)
    this.guiController.positionY.setValue(this.INTERSECTED.position.y)
    this.guiController.positionZ.setValue(this.INTERSECTED.position.z)
    this.guiController.rotationX.setValue((this.INTERSECTED.rotation._x * 180) / Math.PI)
    this.guiController.rotationY.setValue((this.INTERSECTED.rotation._y * 180) / Math.PI)
    this.guiController.rotationZ.setValue((this.INTERSECTED.rotation._z * 180) / Math.PI)
    this.guiController.scaleX.setValue(this.INTERSECTED.scale.x)
    this.guiController.scaleY.setValue(this.INTERSECTED.scale.y)
    this.guiController.scaleZ.setValue(this.INTERSECTED.scale.z)
    this.guiController.scale.setValue(
      Math.min(this.INTERSECTED.scale.x, this.INTERSECTED.scale.y, this.INTERSECTED.scale.z)
    )

    this.guiController.castShadow.setValue(this.INTERSECTED.castShadow)
    this.guiController.receiveShadow.setValue(this.INTERSECTED.receiveShadow)

    this.guiController.textureUrl.setValue(this.INTERSECTED.userData['textureUrl'])
    this.guiController.textureRepeatX.setValue(this.INTERSECTED.userData['textureRepeatX'])
    this.guiController.textureRepeatY.setValue(this.INTERSECTED.userData['textureRepeatY'])

    if (this.INTERSECTED.material && this.INTERSECTED.material instanceof THREE.MeshPhongMaterial) {
      this.INTERSECTED.currentHex = this.INTERSECTED.material.emissive.getHex()
      this.INTERSECTED.material.emissive.setHex(0x333333)
      this.guiController.bumpScale.setValue(this.INTERSECTED.material.bumpScale)
      this.guiController.shininess.setValue(this.INTERSECTED.material.shininess)
    }
    if (this.INTERSECTED.material) {
      this.guiController.opacity.setValue(this.INTERSECTED.material.opacity)
    }

    // 绑定
    let bindData = this.INTERSECTED.userData['bind'] || {}
    for (let k in this.guiController) {
      if (k.indexOf('bind_') !== 0) {
        continue
      }

      let kk = k.replace('bind_', '')
      this.guiController[k].setValue(bindData[kk] || '')
    }

    this.guiEnabled = true

    this.transformControl.attach(this.INTERSECTED)
    this.targetPosition = this.INTERSECTED.position.clone()
    if (this.INTERSECTED.userData['type'] == 'TubeBox') {
      this.targetPosition.set(
        this.targetPosition.x + this.INTERSECTED.parent.position.x,
        this.targetPosition.y + this.INTERSECTED.parent.position.y,
        this.targetPosition.z + this.INTERSECTED.parent.position.z
      )
    }
    this.animateCamera(this.orbit.target, this.targetPosition)
  }

  // 渲染、动画
  render() {
    this.renderer.render(this.scene, this.camera)
  }

  onWindowResize() {
    this.camera.aspect = this.divMain.offsetWidth / this.divMain.offsetHeight
    this.camera.updateProjectionMatrix()
    this.render()
    this.renderer.setSize(this.divMain.offsetWidth, this.divMain.offsetHeight)
  }

  animate(time) {
    // 更新控制器
    this.orbit.update()
    TWEEN.update(time)
    this.render()

    // 更新性能插件
    this.stats.update()
    requestAnimationFrame(this.animate.bind(this))
  }

  // 3D物体
  addObj(geometry, position, color, textureUrl) {
    color = color || '#' + Math.random().toString(16).substr(2, 6).toUpperCase()
    textureUrl = textureUrl || ''

    // let material = new THREE.MeshPhysicalMaterial( { color: color, side: THREE.DoubleSide, shadowSide: THREE.BackSide } );
    // let material = new THREE.MeshBasicMaterial( { color: color, side: THREE.DoubleSide, shadowSide: THREE.BackSide } );
    // let material = new THREE.MeshLambertMaterial( { color: color, side: THREE.DoubleSide, shadowSide: THREE.BackSide } );
    let material = new THREE.MeshPhongMaterial({
      color: color,
      side: THREE.DoubleSide,
      shadowSide: THREE.BackSide,
    })
    // let material = new THREE.MeshStandardMaterial( { color: color, side: THREE.DoubleSide, shadowSide: THREE.BackSide } );

    // 纹理
    let texture = null
    if (textureUrl) {
      texture = new THREE.TextureLoader().load(textureUrl)
      texture.repeat.set(3, 3)
    } else {
      texture = new THREE.TextureLoader().load('./3d_assets/texture/texture01.jpg')
      texture.repeat.set(0, 0)
    }

    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping

    material.map = texture
    material.bumpMap = texture
    material.bumpScale = 0.2

    let obj = new THREE.Mesh(geometry, material)
    obj.castShadow = true
    obj.receiveShadow = true

    obj.userData['type'] = geometry.type.replace('Buffer', '').replace('Geometry', '')
    obj.userData['geometryParams'] = geometry.parameters
    obj.userData['materialParams'] = {
      color: color,
      bumpScale: 0.2,
      shininess: 30,
      opacity: 1,
    }
    obj.userData['textureUrl'] = textureUrl
    obj.userData['textureRepeatX'] = 3
    obj.userData['textureRepeatY'] = 3
    obj.userData['bind'] = {}

    this.scene.add(obj)
    obj.position.set(position.x, position.y, position.z)

    /*
      // 添加外框
      const outlineMaterial1 = new THREE.MeshBasicMaterial( { color: 0x0000ff, side: THREE.BackSide } );
      const outlineMesh1 = new THREE.Mesh( geometry, outlineMaterial1 );
      // outlineMesh1.position = position;
      outlineMesh1.scale.multiplyScalar(1.03);
      scene.add( outlineMesh1 );
      objList.push(outlineMesh1);
      outlineMesh1.position.set(position.x,position.y,position.z);
    */

    return obj
  }

  // 添加3D文字
  addText(txt, size, height, color, fnCallback) {
    size = size || 3
    height = height || 1
    color = color || '#FF0000'
    let loader = new FontLoader()
    loader.load('./3d_assets/font/helvetiker_regular.typeface.json', (font) => {
      let textOption = {
        size: size,
        height: height,
        curveSegments: 10,
        font: font,
        weight: 'normal',
        style: 'normal',
        bevelThickness: 0.1,
        bevelSize: 0.1,
        bevelEnabled: false,
        material: 0,
        extrudeMaterial: 1,
      }
      let textGeom = new TextGeometry(txt, textOption)
      // font: helvetiker, gentilis, droid sans, droid serif, optimer
      // weight: normal, bold

      let material = new THREE.MeshPhongMaterial({
        color: color,
        side: THREE.DoubleSide,
        shadowSide: THREE.BackSide,
        flatShading: true,
      })

      let texture = new THREE.TextureLoader().load('./3d_assets/texture/texture01.jpg')
      texture.wrapS = THREE.RepeatWrapping
      texture.wrapT = THREE.RepeatWrapping
      texture.repeat.set(0, 0)

      material.map = texture
      material.bumpMap = texture
      material.bumpScale = 0.2

      let textMesh = new THREE.Mesh(textGeom, material)
      textMesh.castShadow = true
      textMesh.receiveShadow = true

      textGeom.computeBoundingBox()
      let textWidth = textGeom.boundingBox.max.x - textGeom.boundingBox.min.x

      textMesh.position.set(-0.5 * textWidth, 20, 0)
      // textMesh.rotation.x = -Math.PI / 4;

      delete textOption.font
      textMesh.userData['type'] = textGeom.type.replace('Buffer', '').replace('Geometry', '')
      textMesh.userData['geometryParams'] = textOption
      textMesh.userData['materialParams'] = {
        color: color,
        bumpScale: 0.2,
        shininess: 30,
        opacity: 1,
      }
      textMesh.userData['text'] = txt
      textMesh.userData['textureUrl'] = ''
      textMesh.userData['textureRepeatX'] = 3
      textMesh.userData['textureRepeatY'] = 3
      textMesh.userData['bind'] = {}

      this.scene.add(textMesh)
      if (fnCallback) {
        fnCallback(textMesh)
      }
    })
  }

  // 添加SVG
  addSvg(svgUrl, fnCallback) {
    let loader = new SVGLoader()
    loader.load(svgUrl, (data) => {
      let paths = data.paths

      let group = new THREE.Group()
      // group.scale.multiplyScalar(0.05);
      group.position.x = 0
      group.position.y = 30
      group.scale.y *= -1

      for (let i = 0; i < paths.length; i++) {
        let path = paths[i]

        let fillColor = path.userData.style.fill
        if (fillColor !== undefined && fillColor !== 'none') {
          let material = new THREE.MeshBasicMaterial({
            color: new THREE.Color().setStyle(fillColor),
            opacity: path.userData.style.fillOpacity,
            transparent: path.userData.style.fillOpacity < 1,
            side: THREE.DoubleSide,
            depthWrite: false,
            wireframe: false,
          })

          let shapes = path.toShapes(true)

          for (let j = 0; j < shapes.length; j++) {
            let shape = shapes[j]
            let geometry = new THREE.ShapeBufferGeometry(shape)
            let mesh = new THREE.Mesh(geometry, material)
            mesh.castShadow = true
            // mesh.receiveShadow = true;

            mesh.scale.multiplyScalar(0.03)
            group.add(mesh)
          }
        }

        let strokeColor = path.userData.style.stroke
        if (strokeColor !== undefined && strokeColor !== 'none') {
          let material = new THREE.MeshBasicMaterial({
            color: new THREE.Color().setStyle(strokeColor),
            opacity: path.userData.style.strokeOpacity,
            transparent: path.userData.style.strokeOpacity < 1,
            side: THREE.DoubleSide,
            depthWrite: false,
            wireframe: false,
          })

          for (let j = 0, jl = path.subPaths.length; j < jl; j++) {
            let subPath = path.subPaths[j]
            let geometry = SVGLoader.pointsToStroke(subPath.getPoints(), path.userData.style)
            if (geometry) {
              let mesh = new THREE.Mesh(geometry, material)
              mesh.castShadow = true
              mesh.scale.multiplyScalar(0.03)
              group.add(mesh)
            }
          }
        }
      }

      group.userData['type'] = 'Svg'
      group.userData['svgUrl'] = svgUrl
      group.userData['bind'] = {}

      this.scene.add(group)
      if (fnCallback) {
        fnCallback(group)
      }
    })
  }

  // 添加图片
  addImg(imgUrl) {
    let spriteMap = new THREE.TextureLoader().load(imgUrl)

    let spriteMaterial = new THREE.SpriteMaterial({ map: spriteMap, color: 0xffffff })

    let sprite = new THREE.Sprite(spriteMaterial)
    sprite.scale.set(1, 1, 1)

    sprite.userData['type'] = 'Img'
    sprite.userData['imgUrl'] = imgUrl
    sprite.userData['materialParams'] = {
      opacity: 1,
    }
    sprite.userData['bind'] = {}

    this.scene.add(sprite)

    return sprite
  }

  addModel(model_name, fnCallback) {
    // 加载 glTF 格式的模型
    let loader = new GLTFLoader() /* 实例化加载器 */
    loader.setPath('./3d_assets/models/')
    /*
      const dracoLoader = new THREE.DRACOLoader();
      dracoLoader.setDecoderPath( './3d_assets/js/libs/draco/' );
      loader.setDRACOLoader( dracoLoader );
    */

    loader.load(
      model_name,
      (obj) => {
        let modelObj = obj.scene
        modelObj.userData['type'] = 'Model'
        modelObj.userData['modelName'] = model_name
        modelObj.userData['bind'] = {}
        this.scene.add(modelObj)
        modelObj.scale.x = 50
        modelObj.scale.y = 50
        modelObj.scale.z = 50
        modelObj.traverse((object) => {
          if (object.isMesh) {
            object.castShadow = true
            object.receiveShadow = true
            object.material.metalness = 0.5
          }
        })

        if (fnCallback) {
          fnCallback(modelObj)
        }
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
      },
      (error) => {
        console.log('load error!', error)
      }
    )
  }

  // 文字标签
  addMarker(txt, parameters) {
    if (parameters === undefined) parameters = {}
    let fontface = Object.prototype.hasOwnProperty.call(parameters, 'fontface')
      ? parameters['fontface']
      : 'Arial'

    let fontsize = Object.prototype.hasOwnProperty.call(parameters, 'fontsize')
      ? parameters['fontsize']
      : 48

    let borderThickness = Object.prototype.hasOwnProperty.call(parameters, 'borderThickness')
      ? parameters['borderThickness']
      : 4

    let borderColor = Object.prototype.hasOwnProperty.call(parameters, 'borderColor')
      ? parameters['borderColor']
      : 'rgba(0,0,0,0.7)'

    let backgroundColor = Object.prototype.hasOwnProperty.call(parameters, 'backgroundColor')
      ? parameters['backgroundColor']
      : 'rgba(255,255,255,0.7)'

    let color = Object.prototype.hasOwnProperty.call(parameters, 'color')
      ? parameters['color']
      : '#000'

    // const spriteAlignment = THREE.SpriteAlignment.topLeft;
    // let spriteAlignment = null

    let canvas = document.createElement('canvas')
    canvas.width = 100
    canvas.height = 50
    let context = canvas.getContext('2d')
    context.font = 'Bold ' + fontsize + 'px ' + fontface

    // get size data (height depends only on font size)
    let metrics = context.measureText(txt)
    let textWidth = metrics.width

    // 重新设置宽度
    canvas = document.createElement('canvas')
    canvas.width = textWidth + borderThickness + 6
    canvas.height = fontsize * 1.4 + borderThickness + 6
    context = canvas.getContext('2d')
    context.font = 'Bold ' + fontsize + 'px ' + fontface

    // background color
    context.fillStyle = backgroundColor
    // border color
    context.strokeStyle = borderColor

    context.lineWidth = borderThickness
    this.roundRect(
      context,
      borderThickness / 2,
      borderThickness / 2,
      textWidth + borderThickness,
      fontsize * 1.4 + borderThickness,
      6
    )
    // 1.4 is extra height factor for text below baseline: g,j,p,q.

    // text color
    context.fillStyle = color

    context.fillText(txt, borderThickness, fontsize + borderThickness)
    // $('body').append(canvas);

    // canvas contents will be used for a texture
    let texture = new THREE.CanvasTexture(canvas)

    let spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true })
    let sprite = new THREE.Sprite(spriteMaterial)
    let zoom = fontsize / 48
    sprite.scale.set((zoom * canvas.width) / canvas.height, zoom, zoom)
    sprite.center.set(0.5, 0)

    sprite.userData['type'] = 'Marker'
    sprite.userData['markerParams'] = parameters
    sprite.userData['markerParams']['text'] = txt
    sprite.userData['materialParams'] = {
      opacity: 1,
    }
    sprite.userData['bind'] = {}

    this.scene.add(sprite)

    return sprite
  }

  // 绘制圆角矩形的函数
  roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
  }

  // 添加管道
  addTube(radius, radialSegments, color) {
    let curve = new THREE.CatmullRomCurve3(
      [new THREE.Vector3(-10, 0, 0), new THREE.Vector3(10, 0, 0)],
      false,
      'catmullrom',
      0.0001
    )

    // 可能的值为centripetal、chordal和catmullrom。
    // 当.type为catmullrom时，定义catmullrom的张力。
    curve.arcLengthDivisions = 1

    let geometry = new THREE.TubeBufferGeometry(
      curve,
      curve.points.length * 10,
      radius || 0.5,
      radialSegments || 32
    )
    let mesh = this.addObj(geometry, { x: 0, y: 20, z: 0 }, color)
    mesh.userData['geometryParams'] = {
      closed: mesh.geometry.parameters.closed,
      path: mesh.geometry.parameters.path.points,
      radialSegments: mesh.geometry.parameters.radialSegments,
      radius: mesh.geometry.parameters.radius,
      tubularSegments: mesh.geometry.parameters.tubularSegments,
    }

    this.setTubeBox(mesh)

    return mesh
  }

  // 添加管道控制点
  setTubeBox(tube) {
    let radius = tube.userData.geometryParams.radius * 1.2

    tube.children = []
    let points = tube.userData.geometryParams.path

    for (let i = 0; i < points.length; i++) {
      let material1 = new THREE.MeshBasicMaterial({ color: '#00FF00' })
      material1.transparent = true
      material1.opacity = 0.8
      let geometry = new THREE.DodecahedronBufferGeometry(radius, 2)
      let obj = new THREE.Mesh(geometry, material1)
      obj.userData['type'] = 'TubeBox'
      obj.userData['index'] = i
      obj.userData['point_type'] = 'solid'

      tube.add(obj)

      obj.position.set(points[i].x, points[i].y, points[i].z)
    }

    for (let i = 1; i < points.length; i++) {
      let material2 = new THREE.MeshBasicMaterial({ color: '#0000FF' })
      material2.transparent = true
      material2.opacity = 0.5

      let geometry = new THREE.DodecahedronBufferGeometry(radius, 2)
      let obj = new THREE.Mesh(geometry, material2)
      obj.userData['type'] = 'TubeBox'
      obj.userData['index'] = i - 0.5
      obj.userData['point_type'] = 'dotted'

      tube.add(obj)

      let x = (points[i].x + points[i - 1].x) / 2
      let y = (points[i].y + points[i - 1].y) / 2
      let z = (points[i].z + points[i - 1].z) / 2

      obj.position.set(x, y, z)
    }
  }

  getTubeBox(tube, index) {
    let curBox = null

    for (let k in tube.children) {
      let box = tube.children[k]
      if (box.userData['index'] == index) {
        curBox = box
        break
      }
    }

    return curBox
  }

  // 更新
  updateTube() {
    if (this.INTERSECTED.userData['type'] != 'TubeBox') return

    let x = 0
    let y = 0
    let z = 0

    let cur = this.INTERSECTED
    let tube = cur.parent

    let radius = tube.userData['geometryParams'].radius * 1.2
    let count = tube.userData['geometryParams']['path'].length

    if (cur.userData['point_type'] == 'dotted') {
      // 新加一个控制点
      cur.userData['point_type'] = 'solid'
      cur.material.opacity = 0.8
      cur.material.color.set('#00FF00')

      // 大于的全加1
      for (let k in tube.children) {
        let box = tube.children[k]
        if (box.userData['index'] > cur.userData['index']) {
          box.userData['index'] += 1
        }
      }

      cur.userData['index'] = Math.floor(cur.userData['index']) + 1
      count += 1

      // 添加两个虚的控制点
      let box1 = this.getTubeBox(tube, cur.userData['index'] - 1)
      let box2 = this.getTubeBox(tube, cur.userData['index'] + 1)

      // 前面的控制点
      let material1 = new THREE.MeshBasicMaterial({ color: '#0000FF' })
      material1.transparent = true
      material1.opacity = 0.5

      let geometry1 = new THREE.DodecahedronBufferGeometry(radius, 2)
      let obj1 = new THREE.Mesh(geometry1, material1)
      obj1.userData['type'] = 'TubeBox'
      obj1.userData['index'] = cur.userData['index'] - 0.5
      obj1.userData['point_type'] = 'dotted'

      tube.add(obj1)

      x = (cur.position.x + box1.position.x) / 2
      y = (cur.position.y + box1.position.y) / 2
      z = (cur.position.z + box1.position.z) / 2

      obj1.position.set(x, y, z)

      // 后面的控制点
      let material2 = new THREE.MeshBasicMaterial({ color: '#0000FF' })
      material2.transparent = true
      material2.opacity = 0.5

      let geometry2 = new THREE.DodecahedronBufferGeometry(radius, 2)
      let obj2 = new THREE.Mesh(geometry2, material2)
      obj2.userData['type'] = 'TubeBox'
      obj2.userData['index'] = cur.userData['index'] + 0.5
      obj2.userData['point_type'] = 'dotted'

      tube.add(obj2)

      x = (cur.position.x + box2.position.x) / 2
      y = (cur.position.y + box2.position.y) / 2
      z = (cur.position.z + box2.position.z) / 2

      obj2.position.set(x, y, z)
    }

    let points = []
    for (let i = 0; i < count; i++) {
      let box = this.getTubeBox(tube, i)
      if (box) {
        let p = box.position
        points.push(new THREE.Vector3(p.x, p.y, p.z))
      }
    }

    if (cur.userData['index'] > 0) {
      let box = this.getTubeBox(tube, cur.userData['index'] - 0.5)
      let box1 = this.getTubeBox(tube, cur.userData['index'] - 1)

      x = (cur.position.x + box1.position.x) / 2
      y = (cur.position.y + box1.position.y) / 2
      z = (cur.position.z + box1.position.z) / 2

      box.position.set(x, y, z)
    }
    if (cur.userData['index'] < count - 1) {
      let box = this.getTubeBox(tube, cur.userData['index'] + 0.5)
      let box1 = this.getTubeBox(tube, cur.userData['index'] + 1)

      x = (cur.position.x + box1.position.x) / 2
      y = (cur.position.y + box1.position.y) / 2
      z = (cur.position.z + box1.position.z) / 2

      box.position.set(x, y, z)
    }

    let curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.0001)
    curve.arcLengthDivisions = 1

    let geoParam = tube.userData['geometryParams']

    tube.geometry = new THREE.TubeBufferGeometry(
      curve,
      curve.points.length * 10,
      geoParam['radius'],
      geoParam['radialSegments']
    )
    tube.userData['geometryParams']['path'] = points
  }

  // 相机动画
  animateCamera(current1, current2) {
    let positionVar = {
      x1: current1.x,
      y1: current1.y,
      z1: current1.z,
    }
    // 关闭控制器
    // orbit.enabled = false;
    this.tween = new TWEEN.Tween(positionVar)
    this.tween.to(
      {
        x1: current2.x,
        y1: current2.y,
        z1: current2.z,
      },
      500
    )

    this.tween.onUpdate(() => {
      this.orbit.target.set(positionVar.x1, positionVar.y1, positionVar.z1)
      this.orbit.update()
    })

    this.tween.onComplete(() => {
      // 开启控制器
      // orbit.enabled = true;
    })

    // tween.easing(TWEEN.Easing.Quadratic.Out);
    this.tween.start()
  }

  // 添加3D
  add(type) {
    let geometry = null
    let arr = []
    let tt = this.orbit.target
    switch (type) {
      case 'BoxGeometry':
        arr = this.parseNum(window.prompt('立方体 (X,Y,Z)', '1,1,1'))
        if (arr === null) return
        geometry = new THREE.BoxBufferGeometry(arr[0], arr[1], arr[2])
        geometry.translate(0, arr[1] / 2, 0)
        break
      case 'ConeGeometry':
        arr = this.parseNum(window.prompt('圆锥形 (半径，高度，分隔)', '1,1,32'))
        if (arr === null) return
        geometry = new THREE.ConeBufferGeometry(arr[0], arr[1], arr[2])
        geometry.translate(0, arr[1] / 2, 0)
        break
      case 'CylinderGeometry':
        arr = this.parseNum(window.prompt('圆柱体 (顶半径，底半径，高度，分隔)', '1,1,3,32'))
        if (arr === null) return
        geometry = new THREE.CylinderBufferGeometry(arr[0], arr[1], arr[2], arr[3])
        geometry.translate(0, arr[2] / 2, 0)
        break
      case 'DodecahedronGeometry':
        arr = this.parseNum(window.prompt('12面体 (半径，顶数)', '1,2'))
        if (arr === null) return
        geometry = new THREE.DodecahedronBufferGeometry(arr[0], arr[1])
        break
      case 'IcosahedronGeometry':
        arr = this.parseNum(window.prompt('20面体 (半径，顶数)', '1,0'))
        if (arr === null) return
        geometry = new THREE.IcosahedronBufferGeometry(arr[0], arr[1])
        break
      case 'OctahedronGeometry':
        arr = this.parseNum(window.prompt('八面几何体 (半径，顶数)', '1,0'))
        if (arr === null) return
        geometry = new THREE.OctahedronBufferGeometry(arr[0], arr[1])
        break
      case 'RingGeometry':
        arr = this.parseNum(
          window.prompt('圆环平面体 (内部半径，外部半径，圆环的分段数)', '1,2,32')
        )
        if (arr === null) return
        geometry = new THREE.RingBufferGeometry(arr[0], arr[1], arr[2])
        break
      case 'SphereGeometry':
        arr = this.parseNum(window.prompt('球几何体 (半径，水平分隔，竖直分隔)', '2,16,16'))
        if (arr === null) return
        geometry = new THREE.SphereBufferGeometry(arr[0], arr[1], arr[2])
        break
      case 'TetrahedronGeometry':
        arr = this.parseNum(window.prompt('四面体 (半径，顶点数)', '2,0'))
        if (arr === null) return
        geometry = new THREE.TetrahedronBufferGeometry(arr[0], arr[1])
        break
      case 'TorusGeometry':
        arr = this.parseNum(
          window.prompt(
            '圆环几何体 (圆环的半径，管道半径，圆环的分段数，管道的分段数，圆环的中心角)',
            '5,1,32,32,360'
          )
        )
        if (arr === null) return
        arr[4] = (arr[4] * Math.PI) / 180
        geometry = new THREE.TorusBufferGeometry(arr[0], arr[1], arr[2], arr[3], arr[4])
        break
      case 'Text': {
        let s1 = window.prompt('文本 (大小，厚度，颜色|文本)', '3,1,#ff0000|Hello')
        if (s1 === null || s1.length < 2) return
        s1 = s1.split('|')
        arr = this.parseNum(s1[0])
        this.addText(s1[1], arr[0], arr[1], arr[2], (txtObj) => {
          txtObj.position.set(tt.x, tt.y, tt.z)
          this.selectObj(txtObj)
        })
        return
      }
      case 'Marker': {
        let s2 = window.prompt('标签 (大小，颜色|文本)', '36,#ff0000|Hello')
        if (s2 === null || s2.length < 2) return
        s2 = s2.split('|')
        arr = this.parseNum(s2[0])
        let markerOption = {
          fontsize: arr[0],
          color: arr[1],
        }
        let spritey = this.addMarker(' ' + s2[1] + ' ', markerOption)
        spritey.position.set(tt.x, tt.y, tt.z)
        this.selectObj(spritey)
        return
      }
      case 'Svg': {
        let svgUrl = window.prompt('SVG图片 (图片URL)', './3d_assets/models/svg/threejs.svg')
        if (!svgUrl) return
        this.addSvg(svgUrl, (svgObj) => {
          this.selectObj(svgObj)
        })
        break
      }
      case 'Img': {
        let imgUrl = window.prompt('IMG图片 (图片URL)', './3d_assets/models/png/test.png')
        if (!imgUrl) return
        let imgObj = this.addImg(imgUrl)
        imgObj.position.set(tt.x, tt.y, tt.z)
        this.selectObj(imgObj)
        break
      }
      case 'Model': {
        let modelName = window.prompt('GLB模型 (GLB名称)', '3d.glb')
        if (!modelName) return
        this.addModel(modelName, (modelObj) => {
          this.selectObj(modelObj)
          modelObj.position.set(tt.x, tt.y, tt.z)
        })
        break
      }
      case 'Tube': {
        arr = this.parseNum(window.prompt('管道 (半径,圆分段数,颜色)', '0.25,32,#FF0000'))
        if (arr === null) return
        let tubeObj = this.addTube(arr[0], arr[1], arr[2])
        this.selectObj(tubeObj)
        break
      }
    }

    if (geometry) {
      let obj = this.addObj(geometry, this.orbit.target, '#F00')
      this.selectObj(obj)
    }
  }

  // 转换数字
  parseNum(str) {
    if (str === null) return null
    let arr = str.split(',')
    let aa = []
    for (let k in arr) {
      if (arr[k].indexOf('#') === 0) {
        aa.push(arr[k])
      } else {
        aa.push(parseFloat(arr[k]))
      }
    }

    return aa
  }

  save() {
    let saveData = {}
    saveData['time'] = new Date().toLocaleString()
    saveData['version'] = this.version

    saveData['base'] = {
      autoRotate: this.gui.autoRotate,
    }

    // 雾气
    saveData['base']['fog'] = {
      fogColor: this.gui.fogColor,
      fogDensity: this.gui.fogDensity,
    }

    // 元素列表
    let list = []
    for (let k in this.scene.children) {
      let obj = this.scene.children[k]
      if (obj.userData['type']) {
        const rotationVector3 = new THREE.Vector3(obj.rotation.x, obj.rotation.y, obj.rotation.z)
        list.push({
          type: obj.userData.type,
          castShadow: obj.castShadow,
          receiveShadow: obj.receiveShadow,
          position: obj.position,
          rotation: rotationVector3,
          scale: obj.scale,
          userData: obj.userData,
        })
      }
    }
    saveData['list'] = list

    localStorage.setItem('saveData', JSON.stringify(saveData))
    window.alert('保存成功')
  }

  exportJson() {
    let json = localStorage.getItem('saveData')
    if (!json) {
      return window.alert('请先保存再进行导出')
    }
    const blob = new Blob([json], { type: 'text/json;charset=utf-8' })
    FileSaver.saveAs(blob, '3d.json')
  }

  load(saveData) {
    if (!saveData) {
      let json = localStorage.getItem('saveData')
      if (!json) return

      saveData = JSON.parse(json)
    }

    this.clear()

    this.guiEnabled = false

    // 雾气
    let fog = saveData['base']['fog']
    this.scene.fog.color.set(fog.fogColor)
    this.scene.fog.density = fog.fogDensity
    this.guiController.fogColor.setValue(fog.fogColor)
    this.guiController.fogDensity.setValue(fog.fogDensity)

    // 自动旋转
    this.guiController.autoRotate.setValue(saveData['base']['autoRotate'])
    this.orbit.autoRotate = saveData['base']['autoRotate']

    // 加载元素
    for (let k in saveData['list']) {
      let obj = saveData['list'][k]
      let mesh = null
      let geometry = null
      let geoParam = obj.userData.geometryParams
      switch (obj.type) {
        case 'Box':
          geometry = new THREE.BoxBufferGeometry(geoParam.width, geoParam.height, geoParam.depth)
          geometry.translate(0, geoParam.height / 2, 0)
          mesh = this.addObj(
            geometry,
            obj.position,
            obj.userData.materialParams.color,
            obj.userData.textureUrl
          )
          break
        case 'Marker':
          mesh = this.addMarker(obj.userData.markerParams.text, obj.userData.markerParams)
          break
        case 'Svg':
          this.addSvg(obj.userData.svgUrl, (svgObj) => {
            this.setMesh(svgObj, obj)
          })
          continue
        case 'Img':
          mesh = this.addImg(obj.userData.imgUrl)
          break
        case 'Model':
          this.addModel(obj.userData.modelName, (modelObj) => {
            this.setMesh(modelObj, obj)
          })
          continue
        case 'Text':
          this.addText(
            obj.userData.text || '',
            geoParam.size,
            geoParam.height,
            obj.userData.materialParams.color,
            (txtObj) => {
              this.setMesh(txtObj, obj)
            }
          )
          continue
        case 'Cone':
          geometry = new THREE.ConeBufferGeometry(
            geoParam.radius,
            geoParam.height,
            geoParam.radialSegments
          )
          geometry.translate(0, geoParam.height / 2, 0)
          mesh = this.addObj(
            geometry,
            obj.position,
            obj.userData.materialParams.color,
            obj.userData.textureUrl
          )
          break
        case 'Cylinder':
          geometry = new THREE.CylinderBufferGeometry(
            geoParam.radiusTop,
            geoParam.radiusBottom,
            geoParam.height,
            geoParam.radialSegments
          )
          geometry.translate(0, geoParam.height / 2, 0)
          mesh = this.addObj(
            geometry,
            obj.position,
            obj.userData.materialParams.color,
            obj.userData.textureUrl
          )
          break
        case 'Dodecahedron':
          geometry = new THREE.DodecahedronBufferGeometry(geoParam.radius, geoParam.detail)
          mesh = this.addObj(
            geometry,
            obj.position,
            obj.userData.materialParams.color,
            obj.userData.textureUrl
          )
          break
        case 'Icosahedron':
          geometry = new THREE.IcosahedronBufferGeometry(geoParam.radius, geoParam.detail)
          mesh = this.addObj(
            geometry,
            obj.position,
            obj.userData.materialParams.color,
            obj.userData.textureUrl
          )
          break
        case 'Octahedron':
          geometry = new THREE.OctahedronBufferGeometry(geoParam.radius, geoParam.detail)
          mesh = this.addObj(
            geometry,
            obj.position,
            obj.userData.materialParams.color,
            obj.userData.textureUrl
          )
          break
        case 'Ring':
          geometry = new THREE.RingBufferGeometry(
            geoParam.innerRadius,
            geoParam.outerRadius,
            geoParam.thetaSegments
          )
          mesh = this.addObj(
            geometry,
            obj.position,
            obj.userData.materialParams.color,
            obj.userData.textureUrl
          )
          break
        case 'Sphere':
          geometry = new THREE.SphereBufferGeometry(
            geoParam.radius,
            geoParam.widthSegments,
            geoParam.heightSegments
          )
          mesh = this.addObj(
            geometry,
            obj.position,
            obj.userData.materialParams.color,
            obj.userData.textureUrl
          )
          break
        case 'Tetrahedron':
          geometry = new THREE.TetrahedronBufferGeometry(geoParam.radius, geoParam.detail)
          mesh = this.addObj(
            geometry,
            obj.position,
            obj.userData.materialParams.color,
            obj.userData.textureUrl
          )
          break
        case 'Torus':
          geometry = new THREE.TorusBufferGeometry(
            geoParam.radius,
            geoParam.tube,
            geoParam.radialSegments,
            geoParam.tubularSegments,
            geoParam.arc
          )
          mesh = this.addObj(
            geometry,
            obj.position,
            obj.userData.materialParams.color,
            obj.userData.textureUrl
          )
          break
        case 'Tube': {
          let pointList = []
          for (let k in geoParam.path) {
            let p = geoParam.path[k]
            pointList.push(new THREE.Vector3(p.x, p.y, p.z))
          }
          let curve = new THREE.CatmullRomCurve3(pointList, false, 'catmullrom', 0.0001)
          curve.arcLengthDivisions = 1
          geometry = new THREE.TubeBufferGeometry(
            curve,
            curve.points.length * 10,
            geoParam.radius,
            geoParam.radialSegments,
            geoParam.closed
          )
          mesh = this.addObj(
            geometry,
            obj.position,
            obj.userData.materialParams.color,
            obj.userData.textureUrl
          )
          this.setMesh(mesh, obj)
          this.setTubeBox(mesh)
          continue
        }
      }

      this.setMesh(mesh, obj)
    }

    this.guiEnabled = true
  }

  setMesh(mesh, obj) {
    if (!mesh) return

    mesh.position.set(obj.position.x, obj.position.y, obj.position.z)
    mesh.rotation.set(obj.rotation.x, obj.rotation.y, obj.rotation.z)
    mesh.scale.set(obj.scale.x, obj.scale.y, obj.scale.z)
    mesh.userData = obj.userData

    mesh.castShadow = obj.castShadow
    mesh.receiveShadow = obj.receiveShadow

    if (mesh.type != 'Group' && mesh.material && obj.userData.materialParams) {
      mesh.material.color.set(obj.userData.materialParams.color)
      mesh.material.bumpScale = obj.userData.materialParams.bumpScale
      mesh.material.shininess = obj.userData.materialParams.shininess
      mesh.material.opacity = obj.userData.materialParams.opacity
      if (obj.type != 'Marker' && obj.type != 'Img') {
        mesh.material.transparent = mesh.material.opacity < 1
      } else {
        mesh.material.transparent = true
      }

      if ('textureUrl' in obj.userData) {
        if (obj.userData.textureUrl == '') {
          mesh.material.map.repeat.set(0, 0)
        } else {
          mesh.material.map.repeat.set(obj.userData.textureRepeatX, obj.userData.textureRepeatY)
        }
      }
    }
  }

  clear() {
    for (let i = 0; i < this.scene.children.length; i++) {
      let obj = this.scene.children[i]
      if (obj.userData['type']) {
        this.scene.remove(obj)
        i--
      }
    }

    this.INTERSECTED = null
    this.transformControl.detach(this.transformControl.object)
  }
}

export default new ThreejsEditor()
