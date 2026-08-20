import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

// Реальный 3D-персонаж (facecap.glb — голова с полным набором ARKit blendshapes,
// включая jawOpen / mouthFunnel / mouthPucker / eyeBlink). Липсинк управляется
// через morph targets, синхронно с озвучкой (статус talking).
// Пропсы: talking (говорит), listening (слушает), thinking (ищет ответ).

const MODEL_URL = `${import.meta.env.BASE_URL}models/facecap.glb`

// Симметричные морфы (задаём сразу оба L/R)
const PAIRS = {
  mouthSmile: ['mouthSmile_L', 'mouthSmile_R'],
  mouthStretch: ['mouthStretch_L', 'mouthStretch_R'],
  mouthFrown: ['mouthFrown_L', 'mouthFrown_R'],
  eyeBlink: ['eyeBlink_L', 'eyeBlink_R'],
  browDown: ['browDown_L', 'browDown_R'],
  eyeLookUp: ['eyeLookUp_L', 'eyeLookUp_R'],
  eyeLookDown: ['eyeLookDown_L', 'eyeLookDown_R'],
  eyeSquint: ['eyeSquint_L', 'eyeSquint_R'],
  eyeWide: ['eyeWide_L', 'eyeWide_R'],
}

// «Фонемы» для липсинка: комбинации морф-таргетов, между которыми циклически переключаемся.
const VISEMES = [
  { jawOpen: 0.85, mouthFunnel: 0.15, mouthPucker: 0.0, mouthStretch: 0.0, mouthSmile: 0.05 },
  { jawOpen: 0.45, mouthFunnel: 0.0, mouthPucker: 0.0, mouthStretch: 0.35, mouthSmile: 0.3 },
  { jawOpen: 0.55, mouthFunnel: 0.75, mouthPucker: 0.0, mouthStretch: 0.0, mouthSmile: 0.05 },
  { jawOpen: 0.25, mouthFunnel: 0.0, mouthPucker: 0.7, mouthStretch: 0.0, mouthSmile: 0.0 },
  { jawOpen: 0.12, mouthFunnel: 0.0, mouthPucker: 0.0, mouthStretch: 0.0, mouthSmile: 0.0, mouthClose: 0.5 },
]

export default function Avatar({ talking = false, listening = false, thinking = false }) {
  const mountRef = useRef(null)
  const animRef = useRef({ talking: false, listening: false, thinking: false })
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    animRef.current.talking = talking
  }, [talking])
  useEffect(() => {
    animRef.current.listening = listening
  }, [listening])
  useEffect(() => {
    animRef.current.thinking = thinking
  }, [thinking])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.1
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50)
    camera.position.set(0, 0, 3.2)

    // Освещение «портретное»
    scene.add(new THREE.AmbientLight(0xffffff, 0.5))
    const key = new THREE.DirectionalLight(0xfff1dd, 1.6)
    key.position.set(1.5, 2.5, 3)
    scene.add(key)
    const rim = new THREE.DirectionalLight(0x9fc4ff, 1.0)
    rim.position.set(-2.5, 1.5, -1.5)
    scene.add(rim)
    const fill = new THREE.DirectionalLight(0xffd9a0, 0.55)
    fill.position.set(-0.5, -0.5, 3.5)
    scene.add(fill)

    const group = new THREE.Group()
    scene.add(group)

    const morph = {
      head: null,
      dict: null,
      values: null,
    }

    const setMorph = (name, v) => {
      if (!morph.dict || !morph.values) return
      const i = morph.dict[name]
      if (i !== undefined) morph.values[i] = v
    }
    const setPair = (key, v) => {
      ;(PAIRS[key] || []).forEach((n) => setMorph(n, v))
    }

    const loader = new GLTFLoader()
    loader.load(
      MODEL_URL,
      (gltf) => {
        const obj = gltf.scene
        // Ищем меш с морф-таргетами
        obj.traverse((o) => {
          if (o.isMesh && o.morphTargetDictionary && o.morphTargetInfluences) {
            morph.head = o
            morph.dict = o.morphTargetDictionary
            morph.values = o.morphTargetInfluences
          }
        })
        group.add(obj)

        // Подгонка: центрируем и масштабируем по bounding box
        const box = new THREE.Box3().setFromObject(obj)
        const size = box.getSize(new THREE.Vector3())
        const center = box.getCenter(new THREE.Vector3())
        const maxDim = Math.max(size.x, size.y, size.z) || 1
        const scale = 1.7 / maxDim
        group.scale.setScalar(scale)
        group.position.sub(center.clone().multiplyScalar(scale))
        group.position.y += 0.02

        if (!morph.head) setFailed(true)
      },
      undefined,
      () => setFailed(true)
    )

    // Мягкая тень под персонажем
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(1.1, 64),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.16 })
    )
    shadow.rotation.x = -Math.PI / 2
    shadow.position.y = -1.15
    scene.add(shadow)

    const resize = () => {
      const w = mount.clientWidth
      const h = mount.clientHeight
      if (!w || !h) return
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    resize()
    window.addEventListener('resize', resize)

    const clock = new THREE.Clock()
    let visemeIdx = 0
    let visemeTimer = 0
    let blinkTimer = 0
    let nextBlink = 2 + Math.random() * 3
    const cur = { jawOpen: 0, mouthFunnel: 0, mouthPucker: 0, mouthStretch: 0, mouthSmile: 0, mouthClose: 0 }

    const lerp = (a, b, k) => a + (b - a) * k

    const loop = () => {
      const dt = Math.min(clock.getDelta(), 0.1)
      const t = clock.elapsedTime
      const s = animRef.current

      if (morph.values) {
        // --- Выбор целевой «фонемы» при разговоре ---
        let target = null
        if (s.talking) {
          visemeTimer -= dt
          if (visemeTimer <= 0) {
            visemeIdx = Math.floor(Math.random() * VISEMES.length)
            visemeTimer = 0.09 + Math.random() * 0.08
          }
          target = VISEMES[visemeIdx]
        } else if (s.listening) {
          target = { jawOpen: 0.18, mouthSmile: 0.08 }
        } else if (s.thinking) {
          target = { jawOpen: 0.05, mouthSmile: 0.05 }
        } else {
          target = { jawOpen: 0.0, mouthSmile: 0.12 } // лёгкая дружелюбная улыбка
        }

        const k = 1 - Math.pow(0.001, dt) // плавная интерполяция
        cur.jawOpen = lerp(cur.jawOpen, target.jawOpen || 0, k)
        cur.mouthFunnel = lerp(cur.mouthFunnel, target.mouthFunnel || 0, k)
        cur.mouthPucker = lerp(cur.mouthPucker, target.mouthPucker || 0, k)
        cur.mouthStretch = lerp(cur.mouthStretch, target.mouthStretch || 0, k)
        cur.mouthSmile = lerp(cur.mouthSmile, target.mouthSmile || 0, k)
        cur.mouthClose = lerp(cur.mouthClose, target.mouthClose || 0, k)

        setMorph('jawOpen', cur.jawOpen)
        setMorph('mouthFunnel', cur.mouthFunnel)
        setMorph('mouthPucker', cur.mouthPucker)
        setPair('mouthStretch', cur.mouthStretch)
        setPair('mouthSmile', cur.mouthSmile)
        setMorph('mouthClose', cur.mouthClose)

        // Брови и глаза по состоянию
        const browUp = s.listening ? 0.35 : s.talking ? 0.12 : 0.05
        setMorph('browInnerUp', browUp)
        setPair('browDown', 0)

        let lookUp = 0
        if (s.thinking) lookUp = 0.5
        setPair('eyeLookUp', lookUp)
        setPair('eyeLookDown', 0)

        // Моргание
        blinkTimer += dt
        if (blinkTimer > nextBlink) {
          blinkTimer = 0
          nextBlink = 2.2 + Math.random() * 3.5
        }
        const blink = blinkTimer < 0.13 ? Math.abs(Math.sin((blinkTimer / 0.13) * Math.PI)) : 0
        setPair('eyeBlink', blink)
      }

      // Покачивание головы
      let sway = Math.sin(t * 0.5) * 0.04
      let nod = 0
      if (s.talking) {
        sway = Math.sin(t * 2.2) * 0.045
        nod = Math.sin(t * 3.1) * 0.02
      } else if (s.listening) {
        sway = 0.05
        nod = 0.04
      } else if (s.thinking) {
        sway = Math.sin(t * 1.1) * 0.08
      }
      group.rotation.y = sway
      group.rotation.x = nod

      renderer.render(scene, camera)
      requestAnimationFrame(loop)
    }
    loop()

    return () => {
      window.removeEventListener('resize', resize)
      renderer.dispose()
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div className="avatar-mount">
      {failed && <div className="model-fallback">3D-модель не загрузилась</div>}
    </div>
  )
}
