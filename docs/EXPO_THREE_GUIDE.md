# ✅ Sử dụng expo-three để load model 3D

## 🎯 Tại sao dùng expo-three?

- ✅ **Tương thích tốt với React Native** - được thiết kế riêng cho Expo
- ✅ **Load GLTF/GLB dễ dàng** - không cần config phức tạp
- ✅ **Hỗ trợ textures** - tự động load textures từ model
- ✅ **Ổn định hơn** - ít lỗi hơn `three-stdlib` trong RN

## 📦 Setup hiện tại

Component `Field3Dview.tsx` đã được cấu hình:

1. **Import expo-three:**
```tsx
import ExpoTHREE from 'expo-three';
```

2. **Dùng THREE.WebGLRenderer** (không phải ExpoTHREE.Renderer):
```tsx
const renderer = new THREE.WebGLRenderer({
  canvas: { /* ... */ },
  context: gl as any,
});
```

3. **Load model bằng ExpoTHREE.loadAsync:**
```tsx
const model = await ExpoTHREE.loadAsync(
  gltfAsset.localUri || gltfAsset.uri
);
```

4. **Add vào scene:**
```tsx
if (model.scene) {
  scene.add(model.scene);
} else {
  scene.add(model);
}
```

---

## 🚀 Cách hoạt động

### 1. Load asset từ bundle
```tsx
const gltfAsset = Asset.fromModule(require('../../assets/football_field/scene.gltf'));
await gltfAsset.downloadAsync();
```

### 2. Load model với expo-three
```tsx
const model = await ExpoTHREE.loadAsync(
  gltfAsset.localUri || gltfAsset.uri
);
```

**ExpoTHREE.loadAsync** tự động:
- Parse GLTF/GLB
- Load textures
- Load binary data (.bin)
- Tạo Three.js objects

### 3. Điều chỉnh model
```tsx
model.scene.scale.set(0.3, 0.3, 0.3);
model.scene.position.set(0, -1, 0);
model.scene.rotation.y = 0;
```

### 4. Add vào scene
```tsx
scene.add(model.scene);
```

---

## 🎨 Load từ URL (online)

```tsx
const model = await ExpoTHREE.loadAsync(
  'https://your-cdn.com/models/field.glb'
);
scene.add(model.scene);
```

---

## 🔧 Load với textures riêng

```tsx
const model = await ExpoTHREE.loadAsync(
  gltfUri,
  (progress) => {
    console.log('Loading:', progress);
  },
  (name) => {
    // Callback khi load texture
    console.log('Loading texture:', name);
  }
);
```

---

## 🎯 Load nhiều models

```tsx
const [field, goalPost, ball] = await Promise.all([
  ExpoTHREE.loadAsync(fieldUri),
  ExpoTHREE.loadAsync(goalUri),
  ExpoTHREE.loadAsync(ballUri),
]);

scene.add(field.scene);
scene.add(goalPost.scene);
scene.add(ball.scene);
```

---

## 🐛 Troubleshooting

### Model không hiển thị
→ Check console log:
```tsx
console.log('Model:', model);
console.log('Has scene?', !!model.scene);
console.log('Children:', model.scene?.children);
```

→ Thử cả 2 cách add:
```tsx
// Cách 1: Add scene
if (model.scene) {
  scene.add(model.scene);
}

// Cách 2: Add trực tiếp
else {
  scene.add(model);
}
```

### Lỗi "Cannot read property 'scene' of undefined"
→ Model chưa load xong. Đảm bảo dùng `await`:
```tsx
const model = await ExpoTHREE.loadAsync(uri); // ← Cần await
```

### Textures không load
→ Đảm bảo file `.bin` và textures cùng folder với `.gltf`:
```
assets/
  └── football_field/
      ├── scene.gltf
      ├── scene.bin
      └── textures/
          └── football_field_baseColor.png
```

→ Hoặc dùng `.glb` (binary, all-in-one):
```tsx
const model = await ExpoTHREE.loadAsync(
  require('../../assets/field.glb')
);
```

### Model quá to/nhỏ
→ Điều chỉnh scale:
```tsx
model.scene.scale.set(0.1, 0.1, 0.1);  // Thu nhỏ 10x
model.scene.scale.set(2, 2, 2);        // Phóng to 2x
```

### Model không đúng vị trí
→ Điều chỉnh position:
```tsx
model.scene.position.set(0, -2, 0);  // Hạ xuống
model.scene.position.set(0, 0, -5);  // Đẩy ra xa
```

### Model xoay sai hướng
→ Điều chỉnh rotation:
```tsx
model.scene.rotation.y = Math.PI;      // 180°
model.scene.rotation.y = Math.PI / 2;  // 90°
```

---

## 📝 So sánh với three-stdlib

| Feature | expo-three | three-stdlib |
|---------|-----------|--------------|
| Load GLTF | ✅ Dễ | ⚠️ Phức tạp |
| Textures | ✅ Tự động | ❌ Thủ công |
| React Native | ✅ Native | ⚠️ Workaround |
| Bundle size | 📦 Nhỏ | 📦 Lớn hơn |
| Stability | ✅ Ổn định | ⚠️ Có lỗi |

**Kết luận:** Dùng `expo-three` cho React Native projects.

---

## 🎯 Best Practices

1. **Luôn dùng await:**
```tsx
const model = await ExpoTHREE.loadAsync(uri);
```

2. **Check model.scene trước khi add:**
```tsx
if (model.scene) {
  scene.add(model.scene);
}
```

3. **Dùng try/catch:**
```tsx
try {
  const model = await ExpoTHREE.loadAsync(uri);
  scene.add(model.scene);
} catch (error) {
  console.error('Load failed:', error);
  // Fallback to simple geometry
}
```

4. **Preload assets:**
```tsx
const asset = Asset.fromModule(require('./model.gltf'));
await asset.downloadAsync();
const model = await ExpoTHREE.loadAsync(asset.localUri);
```

5. **Dispose khi unmount:**
```tsx
useEffect(() => {
  return () => {
    model.scene.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    });
  };
}, []);
```

---

## 📚 Tài liệu

- [expo-three GitHub](https://github.com/expo/expo-three)
- [Three.js Docs](https://threejs.org/docs/)
- [GLTF Format](https://www.khronos.org/gltf/)

---

## ✅ Đã hoàn thành

Component `Field3Dview.tsx` hiện đang dùng:
- ✅ expo-three để load model
- ✅ THREE.WebGLRenderer cho rendering
- ✅ Fallback về plane nếu load thất bại
- ✅ Support cả model.scene và model trực tiếp

**Test:** Reload app → vào RoomDetail → sẽ thấy model 3D!


