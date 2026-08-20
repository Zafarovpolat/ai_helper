import { useEffect, useRef } from 'react'
import * as THREE from 'three'

// Стилизованный 3D-рассказчик (Вариант A) — собран из примитивов, без внешних
// GLB-моделей, поэтому работает офлайн и не требует загрузки. В продакшене
// заменяется на Ready Player Me GLB + TalkingHead.js (см. docs/technical.md).
// Пропсы: talking (говорит), listening (слушает), thinking (ищет ответ).

const SKIN = 0xe7b98c
const CHAPAN = 0x1f4e79
const CHAPAN_DARK = 0x17395a
const GOLD = 0xd4af37
const TUBETEIKA = 0x16161a
const WHITE = 0xf4f1ea
const BEARD = 0x3a2e28

export default function Avatar({ talking = false, listening = false, thinking = false }) {
  const mountRef = useRef(null)
  const animRef = useRef({ talking: false, listening: false, thinking: false })

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
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50)
    camera.position.set(0, 1.62, 3.6)

    // ---- Свет ----
    scene.add(new THREE.AmbientLight(0xffffff, 0.55))
    const key = new THREE.DirectionalLight(0xfff2dd, 1.4)
    key.position.set(2.5, 4, 3)
    scene.add(key)
    const rim = new THREE.DirectionalLight(0x9fc4ff, 0.9)
    rim.position.set(-3, 2.5, -2)
    scene.add(rim)
    const fill = new THREE.DirectionalLight(0xffd9a0, 0.5)
    fill.position.set(0, 1, 4)
    scene.add(fill)

    // ---- Материалы ----
    const skinMat = new THREE.MeshStandardMaterial({ color: SKIN, roughness: 0.65 })
    const chapanMat = new THREE.MeshStandardMaterial({ color: CHAPAN, roughness: 0.8 })
    const chapanDarkMat = new THREE.MeshStandardMaterial({ color: CHAPAN_DARK, roughness: 0.8 })
    const goldMat = new THREE.MeshStandardMaterial({ color: GOLD, roughness: 0.4, metalness: 0.35 })
    const tubMat = new THREE.MeshStandardMaterial({ color: TUBETEIKA, roughness: 0.7 })
    const whiteMat = new THREE.MeshStandardMaterial({ color: WHITE, roughness: 0.6 })
    const beardMat = new THREE.MeshStandardMaterial({ color: BEARD, roughness: 0.9 })
    const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25 })
    const pupilMat = new THREE.MeshStandardMaterial({ color: 0x1a120b, roughness: 0.2 })

    const avatar = new THREE.Group()
    scene.add(avatar)

    // ---- Пьедестал ----
    const plinth = new THREE.Mesh(
      new THREE.CylinderGeometry(0.62, 0.7, 0.12, 48),
      new THREE.MeshStandardMaterial({ color: 0x8a7a5f, roughness: 0.85 })
    )
    plinth.position.y = 0.06
    avatar.add(plinth)
    const plinthTop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.58, 0.58, 0.04, 48),
      new THREE.MeshStandardMaterial({ color: 0x9c8c70, roughness: 0.8 })
    )
    plinthTop.position.y = 0.14
    avatar.add(plinthTop)

    // ---- Тело (чапан) ----
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.5, 0.95, 32), chapanMat)
    body.position.y = 0.75
    avatar.add(body)

    // Вертикальный золотой галун спереди
    const galloon = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.95, 0.02), goldMat)
    galloon.position.set(0, 0.75, 0.48)
    avatar.add(galloon)

    // Пояс
    const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.345, 0.345, 0.09, 32), goldMat)
    belt.position.y = 0.62
    avatar.add(belt)

    // ---- Руки ----
    const armGeo = new THREE.CylinderGeometry(0.09, 0.1, 0.55, 20)
    const armL = new THREE.Mesh(armGeo, chapanDarkMat)
    armL.position.set(-0.46, 0.82, 0)
    armL.rotation.z = 0.25
    avatar.add(armL)
    const armR = new THREE.Mesh(armGeo, chapanDarkMat)
    armR.position.set(0.46, 0.82, 0)
    armR.rotation.z = -0.25
    avatar.add(armR)
    const handGeo = new THREE.SphereGeometry(0.11, 20, 20)
    const handL = new THREE.Mesh(handGeo, skinMat)
    handL.position.set(-0.62, 0.62, 0)
    avatar.add(handL)
    const handR = new THREE.Mesh(handGeo, skinMat)
    handR.position.set(0.62, 0.62, 0)
    avatar.add(handR)

    // ---- Голова ----
    const head = new THREE.Group()
    head.position.y = 1.38
    avatar.add(head)

    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.24, 40, 40), skinMat)
    skull.scale.set(1, 1.05, 0.98)
    head.add(skull)

    // Тюбетейка
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.23, 0.1, 40), tubMat)
    cap.position.y = 0.2
    head.add(cap)
    const capBand = new THREE.Mesh(new THREE.TorusGeometry(0.205, 0.018, 12, 40), whiteMat)
    capBand.position.y = 0.16
    capBand.rotation.x = Math.PI / 2
    head.add(capBand)
    // Орнамент на тюбетейке — маленькие белые «уголки»
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.02, 10, 10), whiteMat)
      dot.position.set(Math.cos(a) * 0.21, 0.16, Math.sin(a) * 0.21)
      head.add(dot)
    }

    // Борода
    const beard = new THREE.Mesh(new THREE.SphereGeometry(0.17, 28, 28), beardMat)
    beard.scale.set(1, 1.15, 0.8)
    beard.position.set(0, -0.14, 0.12)
    head.add(beard)

    // Нос
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.12, 16), skinMat)
    nose.position.set(0, -0.03, 0.24)
    nose.rotation.x = 0.15
    head.add(nose)

    // Брови
    const browGeo = new THREE.BoxGeometry(0.12, 0.025, 0.03)
    const browL = new THREE.Mesh(browGeo, beardMat)
    browL.position.set(-0.08, 0.09, 0.21)
    browL.rotation.z = -0.12
    head.add(browL)
    const browR = new THREE.Mesh(browGeo, beardMat)
    browR.position.set(0.08, 0.09, 0.21)
    browR.rotation.z = 0.12
    head.add(browR)

    // Глаза (blink через масштабирование по Y)
    const makeEye = (x) => {
      const g = new THREE.Group()
      g.position.set(x, 0.03, 0.21)
      const white = new THREE.Mesh(new THREE.SphereGeometry(0.045, 20, 20), eyeWhiteMat)
      white.scale.set(1, 1.15, 0.7)
      g.add(white)
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.02, 16, 16), pupilMat)
      pupil.position.set(0, 0, 0.03)
      g.add(pupil)
      return g
    }
    const eyeL = makeEye(-0.085)
    const eyeR = makeEye(0.085)
    head.add(eyeL)
    head.add(eyeR)

    // Рот (липсинк через scale Y)
    const mouth = new THREE.Mesh(new THREE.SphereGeometry(0.045, 20, 20), new THREE.MeshStandardMaterial({ color: 0x5a2a22, roughness: 0.5 }))
    mouth.scale.set(1.6, 0.5, 0.5)
    mouth.position.set(0, -0.1, 0.21)
    head.add(mouth)

    // Уши
    const earGeo = new THREE.SphereGeometry(0.045, 16, 16)
    const earL = new THREE.Mesh(earGeo, skinMat)
    earL.position.set(-0.22, 0, 0)
    earL.scale.set(0.5, 1, 1)
    head.add(earL)
    const earR = new THREE.Mesh(earGeo, skinMat)
    earR.position.set(0.22, 0, 0)
    earR.scale.set(0.5, 1, 1)
    head.add(earR)

    // ---- Тень под персонажем ----
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.75, 48),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.18 })
    )
    shadow.rotation.x = -Math.PI / 2
    shadow.position.y = 0.005
    avatar.add(shadow)

    // ---- Анимация ----
    const clock = new THREE.Clock()
    let blinkTimer = 0
    let nextBlink = 2 + Math.random() * 3
    const mouthBase = { x: 1.6, y: 0.5, z: 0.5 }

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

    const loop = () => {
      const t = clock.getElapsedTime()
      const s = animRef.current

      // Idle: дыхание + лёгкое покачивание
      const breathe = 1 + Math.sin(t * 1.4) * 0.015
      body.scale.y = breathe
      avatar.rotation.y = Math.sin(t * 0.4) * 0.06

      // Голова
      let headTiltX = 0
      let headTiltY = 0
      if (s.talking) {
        headTiltY = Math.sin(t * 7) * 0.06
        headTiltX = 0.08
      } else if (s.listening) {
        headTiltX = 0.18
        headTiltY = 0.06
      } else if (s.thinking) {
        headTiltX = -0.06
        headTiltY = Math.sin(t * 1.2) * 0.12
      } else {
        headTiltY = Math.sin(t * 0.6) * 0.05
      }
      head.rotation.x = headTiltX
      head.rotation.y = headTiltY

      // Рот
      let targetOpen = 0.5
      if (s.talking) targetOpen = 0.5 + Math.abs(Math.sin(t * 13)) * 2.2
      else if (s.listening) targetOpen = 0.35
      mouth.scale.y += (targetOpen - mouth.scale.y) * 0.35
      mouth.scale.x = mouthBase.x * (2 - mouth.scale.y / 1.6)
      mouth.scale.z = mouthBase.z * (2 - mouth.scale.y / 1.6)

      // Моргание
      blinkTimer += clock.getDelta()
      if (blinkTimer > nextBlink) {
        blinkTimer = 0
        nextBlink = 2.5 + Math.random() * 3.5
      }
      const blinking = blinkTimer < 0.14 ? Math.abs(Math.sin((blinkTimer / 0.14) * Math.PI)) : 1
      const eyeScale = blinking
      eyeL.scale.y = 1.15 * eyeScale
      eyeR.scale.y = 1.15 * eyeScale

      // Медленный поворот камеры
      const camAngle = t * 0.05
      camera.position.x = Math.sin(camAngle) * 0.5
      camera.lookAt(0, 1.35, 0)

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

  return <div ref={mountRef} className="avatar-mount" />
}
