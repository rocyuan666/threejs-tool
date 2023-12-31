/**
 * ThreeJS 播放器
 * version 2.0.0
 */
import TWEEN from '@tweenjs/tween.js'
import Hammer from 'hammerjs'
import * as THREE from 'three'
import { FontLoader } from 'three/addons/loaders/FontLoader'
import { SVGLoader } from 'three/addons/loaders/SVGLoader'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader'
import { OrbitControls } from 'three/addons/controls/OrbitControls'
import { TextGeometry } from 'three/addons/geometries/TextGeometry'

class ThreejsPlay {
  // 版本
  version = '2.0.0'
  saveData = null
  isReady = false
  loadIndex = 0
  baseFont = null
  // 内部变量
  renderer = null
  camera = null
  scene = null
  orbit = null
  raycaster = null
  tween = null
  INTERSECTED = null
  divMain = null
  divInfo = null
  meshLine = null
  targetPosition = null

  init(el, infoEl, handleLoading) {
    this.divMain = el
    this.divInfo = infoEl
    this.handleLoading = handleLoading
    this.initRender()
    this.initScene()
    this.initCamera()
    this.initLight()
    this.initModel()
    this.initControls()
    this.initRaycaster()
    requestAnimationFrame(this.animate.bind(this))
    window.onresize = this.onWindowResize.bind(this)
  }

  /**
   * 释放webGL占用内存
   */
  clearRender() {
    let clearScene = (scene) => {
      let arr = scene.children.filter((x) => x)
      arr.forEach((item) => {
        if (item.children.length) {
          clearScene(item)
        } else {
          if (item.type === 'Mesh') {
            item.geometry.dispose()

            item.material.dispose()

            !!item.clear && item.clear()
          }
        }
      })

      !!scene.clear && scene.clear(this.renderer)

      arr = null
    }

    try {
      clearScene(this.scene)
    } catch (e) {
      /* empty */
    }

    try {
      this.renderer.renderLists.dispose()
      this.renderer.dispose()
      this.renderer.forceContextLoss()
      this.renderer.domElement = null
      this.renderer.content = null
      this.renderer = null
    } catch (e) {
      /* empty */
    }

    if (window.requestAnimationId) {
      cancelAnimationFrame(window.requestAnimationId)
    }

    THREE.Cache.clear()
  }

  //弧度角度换算
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
    this.renderer.setClearColor('#333', 0) // 设置背景颜色
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
    //scene.fog = new THREE.Fog('#ccc', 20, 100);

    // SKYBOX/FOG
    // const skyBoxGeometry = new THREE.CubeGeometry(200, 200, 200);
    // const skyBoxMaterial = new THREE.MeshBasicMaterial({ color: '#367EE3', side: THREE.BackSide });
    // const skyBox = new THREE.Mesh(skyBoxGeometry, skyBoxMaterial);
    // TP.scene.add(skyBox);

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
  }

  initLight() {
    this.scene.add(new THREE.AmbientLight(0x404040))

    let light = new THREE.DirectionalLight(0xffffff)
    light.position.set(0, 50, 50)
    light.castShadow = true
    this.scene.add(light)

    light.shadow.camera.near = 0.5 // default
    light.shadow.camera.far = 500 // default
    light.shadow.camera.top = 100 // default
    light.shadow.camera.right = 100 // default
    light.shadow.camera.bottom = -100 // default
    light.shadow.camera.left = -100 // default

    // LIGHT
    light = new THREE.PointLight(0xffffff, 0.3)
    light.position.set(0, 50, -50)
    light.castShadow = false
    this.scene.add(light)
  }

  initModel() {
    let geometry = new THREE.BoxGeometry(1, 1, 1)

    let wireframe = new THREE.WireframeGeometry(geometry)

    this.meshLine = new THREE.LineSegments(wireframe)
    this.meshLine.material.depthTest = false
    this.meshLine.material.opacity = 0.7
    this.meshLine.material.transparent = true

    this.scene.add(this.meshLine)
    this.meshLine.visible = false
  }

  // 初始化控制
  initControls() {
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
  }

  // 初始化鼠标点击
  initRaycaster() {
    this.raycaster = new THREE.Raycaster()
    let mc = new Hammer(this.divMain)
    mc.on('tap', (event) => {
      if (this.INTERSECTED) {
        this.targetPosition = this.INTERSECTED.position.clone()
        this.animateCamera(this.orbit.target, this.targetPosition)
      }
      event.preventDefault()
      let mouse = new THREE.Vector2()
      let objects = []
      mouse.x = ((event.center.x - 0) / this.divMain.offsetWidth) * 2 - 1
      mouse.y = -(event.center.y / this.divMain.offsetHeight) * 2 + 1

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
      } else {
        this.cancelSelect()
      }
    })
  }

  cancelSelect() {
    if (!this.INTERSECTED) return

    this.meshLine.visible = false
    this.orbit.autoRotate = this.saveData['base']['autoRotate']
    this.INTERSECTED = null
  }

  // 选中3D对象
  selectObj(obj) {
    if (obj == this.INTERSECTED) {
      return
    }

    if (obj.userData['can_select'] === false) {
      return
    }

    this.cancelSelect()

    // 高亮
    this.INTERSECTED = obj

    if (obj.geometry) {
      this.meshLine.geometry = new THREE.WireframeGeometry(obj.geometry)

      this.meshLine.position.set(obj.position.x, obj.position.y, obj.position.z)
      this.meshLine.rotation.set(obj.rotation.x, obj.rotation.y, obj.rotation.z)
      this.meshLine.scale.set(obj.scale.x, obj.scale.y, obj.scale.z)
      this.meshLine.visible = true
    } else {
      this.meshLine.geometry = new THREE.BoxGeometry(1, 1, 1)

      this.meshLine.position.set(obj.position.x, obj.position.y, obj.position.z)
      this.meshLine.rotation.set(0, 0, 0)
      this.meshLine.scale.set(1, 1, 1)
      this.meshLine.visible = true
    }

    this.orbit.autoRotate = false

    this.targetPosition = this.INTERSECTED.position.clone()
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
    //更新控制器
    this.orbit.update()
    TWEEN.update(time)
    this.render()

    requestAnimationFrame(this.animate.bind(this))
  }

  // 3D物体
  addObj(geometry, position, color, textureUrl) {
    color = color || '#' + Math.random().toString(16).substr(2, 6).toUpperCase()
    textureUrl = textureUrl || ''

    let material = new THREE.MeshPhongMaterial({
      color: color,
      side: THREE.DoubleSide,
      shadowSide: THREE.BackSide,
    })

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

    this.scene.add(obj)
    obj.position.set(position.x, position.y, position.z)

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

      this.baseFont = font
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
      //textMesh.rotation.x = -Math.PI / 4;

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
      //group.scale.multiplyScalar(0.05);
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
            let geometry = new THREE.ShapeGeometry(shape)
            let mesh = new THREE.Mesh(geometry, material)
            mesh.castShadow = true
            //mesh.receiveShadow = true;

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

    this.scene.add(sprite)

    return sprite
  }

  addModel(model_name, fnCallback) {
    // 加载 glTF 格式的模型
    let loader = new GLTFLoader() /*实例化加载器*/
    loader.setPath('./3d_assets/models/')

    loader.load(
      model_name,
      (obj) => {
        let modelObj = obj.scene
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

    //const spriteAlignment = THREE.SpriteAlignment.topLeft;
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

    let geometry = new THREE.TubeGeometry(
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

  // 相机动画
  animateCamera(current1, current2) {
    let positionVar = {
      x1: current1.x,
      y1: current1.y,
      z1: current1.z,
    }
    //关闭控制器
    //orbit.enabled = false;
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
      ///开启控制器
      //orbit.enabled = true;
    })

    //tween.easing(TWEEN.Easing.Quadratic.Out);
    this.tween.start()
  }

  load(saveData) {
    this.isReady = false
    this.loadIndex = 0
    this.saveData = saveData

    this.clear()

    // 雾气
    let fog = this.saveData['base']['fog']
    this.scene.fog.color.set(fog.fogColor)
    this.scene.fog.density = fog.fogDensity

    // 自动旋转
    this.orbit.autoRotate = this.saveData['base']['autoRotate']

    // 加载元素
    for (let k in this.saveData['list']) {
      let obj = this.saveData['list'][k]
      let mesh = null
      let geometry = null
      let geoParam = obj.userData.geometryParams
      switch (obj.type) {
        case 'Box':
          geometry = new THREE.BoxGeometry(geoParam.width, geoParam.height, geoParam.depth)
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
          geometry = new THREE.ConeGeometry(
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
          geometry = new THREE.CylinderGeometry(
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
          geometry = new THREE.DodecahedronGeometry(geoParam.radius, geoParam.detail)
          mesh = this.addObj(
            geometry,
            obj.position,
            obj.userData.materialParams.color,
            obj.userData.textureUrl
          )
          break
        case 'Icosahedron':
          geometry = new THREE.IcosahedronGeometry(geoParam.radius, geoParam.detail)
          mesh = this.addObj(
            geometry,
            obj.position,
            obj.userData.materialParams.color,
            obj.userData.textureUrl
          )
          break
        case 'Octahedron':
          geometry = new THREE.OctahedronGeometry(geoParam.radius, geoParam.detail)
          mesh = this.addObj(
            geometry,
            obj.position,
            obj.userData.materialParams.color,
            obj.userData.textureUrl
          )
          break
        case 'Ring':
          geometry = new THREE.RingGeometry(
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
          geometry = new THREE.SphereGeometry(
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
          geometry = new THREE.TetrahedronGeometry(geoParam.radius, geoParam.detail)
          mesh = this.addObj(
            geometry,
            obj.position,
            obj.userData.materialParams.color,
            obj.userData.textureUrl
          )
          break
        case 'Torus':
          geometry = new THREE.TorusGeometry(
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
          geometry = new THREE.TubeGeometry(
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
          continue
        }
      }
      this.setMesh(mesh, obj)
    }
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

    this.parseKeyList(mesh)

    this.loadIndex++
    this.showInfo('加载中... (' + this.loadIndex + '/' + this.saveData.list.length + ')')
    if (this.loadIndex == this.saveData.list.length) {
      this.isReady = true
      this.showInfo('')
      if (this.handleLoading) {
        this.handleLoading(false)
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
  }

  // 移动到指定点
  moveTo(position) {
    this.cancelSelect()
    this.targetPosition = position
    this.animateCamera(this.orbit.target, this.targetPosition)
  }

  // 显示信息
  showInfo(str, color) {
    color = color || '#000'
    this.divInfo.innerHTML = str
    this.divInfo.style.color = color
  }

  // 解析KEY列表
  parseKeyList(mesh) {
    mesh.userData['bind_key'] = {}
    mesh.userData['bind_key_all'] = []
    for (let k in mesh.userData['bind']) {
      let v = mesh.userData['bind'][k]

      let keyList = []

      // 获取key列表
      let start = -1
      for (let p = 0; p < v.length; p++) {
        if (v.substr(p, 2) == '{$') {
          start = p
          continue
        }

        if (v.substr(p, 1) == '}') {
          if (start != -1) {
            let key = v.substr(start + 2, p - start - 2)
            keyList.push(key)
            mesh.userData['bind_key_all'].push(key)
          }
          start = -1
        }
      }

      mesh.userData['bind_key'][k] = {
        keyList: keyList,
        value: v,
      }
    }

    if ('visible' in mesh.userData['bind']) {
      mesh.visible = false
    }
  }

  // 解析值
  bindData(item) {
    if (!this.isReady) return

    let delList = []
    let count = this.scene.children.length
    for (let kk = 0; kk < count; kk++) {
      let obj = this.scene.children[kk]
      if (!obj.userData['type']) continue

      for (let k in obj.userData['bind_key']) {
        let value = this.parseValue(obj.userData['bind_key'][k], item)
        if (!value) continue

        switch (k) {
          case 'name':
            obj.name = value
            break
          case 'visible':
            obj.visible = parseInt(value) == 1
            break
          case 'color':
            if (obj.material && obj.material instanceof THREE.MeshPhongMaterial) {
              obj.material.color.set(value)
            }
            break
          case 'positionX':
            obj.position.x = parseFloat(value)
            break
          case 'positionY':
            obj.position.y = parseFloat(value)
            break
          case 'positionZ':
            obj.position.z = parseFloat(value)
            break
          case 'rotationX':
            obj.rotation.x = this.getRad(parseFloat(value))
            break
          case 'rotationY':
            obj.rotation.y = this.getRad(parseFloat(value))
            break
          case 'rotationZ':
            obj.rotation.z = this.getRad(parseFloat(value))
            break
          case 'scaleX':
            obj.scale.x = parseFloat(value)
            break
          case 'scaleY':
            obj.scale.y = parseFloat(value)
            break
          case 'scaleZ':
            obj.scale.z = parseFloat(value)
            break
          case 'opacity':
            if (obj.material) {
              obj.material.opacity = value
              obj.material.transparent = value != 1
            }
            break
          case 'can_select':
            obj.userData['can_select'] = parseInt(value) == 1
            break
          case 'value':
            switch (obj.userData['type']) {
              case 'Marker': {
                value = ' ' + value.trim() + ' '
                if (obj.userData['markerParams']['text'] == value) {
                  break
                }

                obj.userData['markerParams']['text'] = value

                let objMarker = this.addMarker(value, obj.userData.markerParams)

                objMarker.position.set(obj.position.x, obj.position.y, obj.position.z)
                objMarker.rotation.set(obj.rotation.x, obj.rotation.y, obj.rotation.z)
                objMarker.userData = obj.userData

                objMarker.castShadow = obj.castShadow
                objMarker.receiveShadow = obj.receiveShadow

                delList.push(obj)
                break
              }
              case 'Text': {
                value = '' + value
                if (obj.userData['text'] == value) {
                  break
                }
                obj.userData['text'] = value
                let geoParam = obj.userData.geometryParams
                let textOption = {
                  size: geoParam.size,
                  height: geoParam.height,
                  curveSegments: 10,
                  font: this.baseFont,
                  weight: 'normal',
                  style: 'normal',
                  bevelThickness: 0.1,
                  bevelSize: 0.1,
                  bevelEnabled: false,
                  material: 0,
                  extrudeMaterial: 1,
                }
                obj.geometry = new TextGeometry(value, textOption)
                break
              }
            }
            break
        }
      }
    }
    for (let k in delList) {
      this.scene.remove(delList[k])
    }
  }

  // 解析值
  parseValue(bind, item) {
    let value = bind.value
    if (value.indexOf('{$') == -1) {
      return value
    }
    for (let k of bind.keyList) {
      if (k in item) {
        value = value.replace(new RegExp('\\{\\$' + k + '\\}', 'g'), item[k])
      }
    }
    if (value.indexOf('{$') != -1) {
      return null
    }
    // try {
    //   value = eval(value);
    // } catch (err) {
    //   console.error(err);
    // }
    return value
  }

  formatDate(d) {
    d = d || new Date()

    let f = (v) => ('0' + v).substr(-2)
    return (
      d.getFullYear() +
      '-' +
      f(d.getMonth() + 1) +
      '-' +
      f(d.getDate()) +
      ' ' +
      f(d.getHours()) +
      ':' +
      f(d.getMinutes()) +
      ':' +
      f(d.getSeconds())
    )
  }
}

export default new ThreejsPlay()
