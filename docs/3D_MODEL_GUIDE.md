# Hướng dẫn Load Model 3D (GLB/GLTF) trong Field3DView

## 🎯 Tổng quan

Component `Field3DView` đã được setup sẵn để hiển thị:
- ✅ Sân bóng 3D (hiện tại dùng plane màu xanh)
- ✅ 5 marker vị trí cầu thủ (GK, LB, RB, LW, RW)
- ✅ Ánh sáng và camera

## 📦 Cách 1: Load từ URL (Recommend)

### Bước 1: Upload model lên server/CDN
Upload file `.glb` hoặc `.gltf` lên server của bạn hoặc dùng CDN miễn phí như:
- Cloudinary
- AWS S3
- Firebase Storage
- GitHub raw URL (cho test)

### Bước 2: Sửa code trong `Field3DView.tsx`

Tìm dòng comment `// TODO: load model sân .glb` và uncomment:

```tsx
const loader = new GLTFLoader();
loader.load(
  'https://your-domain.com/models/football-field.glb', // URL của bạn
  (gltf: any) => {
    // Scale và position tùy theo model
    gltf.scene.scale.set(1, 1, 1);
    gltf.scene.position.set(0, 0, 0);
    scene.add(gltf.scene);
  },
  undefined,
  (error: any) => {
    console.error('Error loading model:', error);
  }
);
```

### Bước 3: Điều chỉnh camera và scale
Tùy vào kích thước model, bạn có thể cần điều chỉnh:

```tsx
// Camera position (dòng ~65)
camera.position.set(0, 12, 15); // Tăng y để nhìn xa hơn

// Model scale
gltf.scene.scale.set(0.5, 0.5, 0.5); // Thu nhỏ nếu model quá to
```

---

## 📦 Cách 2: Bundle model vào app (Offline)

### Bước 1: Cài thêm package
```bash
npm install expo-asset expo-file-system
```

### Bước 2: Đặt file GLB vào thư mục assets
```
assets/
  └── models/
      └── football-field.glb
```

### Bước 3: Config metro.config.js
Thêm extension `.glb` và `.gltf`:

```js
// metro.config.js
module.exports = {
  resolver: {
    assetExts: ['glb', 'gltf', 'bin', 'png', 'jpg'],
  },
};
```

### Bước 4: Load model từ assets

```tsx
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';

// Trong onContextCreate:
const asset = Asset.fromModule(require('../../assets/models/football-field.glb'));
await asset.downloadAsync();

const loader = new GLTFLoader();
loader.load(
  asset.localUri || asset.uri,
  (gltf: any) => {
    gltf.scene.scale.set(1, 1, 1);
    scene.add(gltf.scene);
  },
  undefined,
  (error: any) => console.error('Error:', error)
);
```

---

## 🎨 Tìm model sân bóng miễn phí

### Nguồn tải model:
1. **Sketchfab** (https://sketchfab.com)
   - Tìm "football field" hoặc "soccer stadium"
   - Chọn model có license "Download"
   - Download dạng `.glb`

2. **Poly Haven** (https://polyhaven.com)
   - Model chất lượng cao, miễn phí

3. **TurboSquid** (https://www.turbosquid.com)
   - Có cả free và paid

### Lưu ý khi chọn model:
- ✅ Format: `.glb` (tốt nhất) hoặc `.gltf`
- ✅ Poly count: < 50k triangles (để app không lag)
- ✅ Texture: embedded trong GLB hoặc có sẵn

---

## 🔧 Điều chỉnh vị trí marker (player)

Sau khi load model sân, bạn cần điều chỉnh `SLOT_POSITIONS` để marker đứng đúng vị trí trên sân:

```tsx
const SLOT_POSITIONS = [
  new THREE.Vector3(0, 0.5, 4),     // GK - y=0.5 để nổi trên sân
  new THREE.Vector3(-3, 0.5, 1.5),  // LB
  new THREE.Vector3(3, 0.5, 1.5),   // RB
  new THREE.Vector3(-1.5, 0.5, -2), // LW
  new THREE.Vector3(1.5, 0.5, -2),  // RW
];
```

**Cách tìm tọa độ đúng:**
1. Chạy app, xem model sân
2. Thử thay đổi giá trị x, y, z
3. Reload app để xem marker di chuyển
4. Điều chỉnh cho đến khi đúng vị trí

---

## 🐛 Troubleshooting

### Lỗi: "Cannot read property 'scene' of undefined"
→ Model chưa load xong. Thêm loading state hoặc đợi callback.

### Model không hiển thị
→ Kiểm tra:
- Scale có quá nhỏ không? Thử `scale.set(10, 10, 10)`
- Camera có nhìn đúng hướng không?
- Có ánh sáng không? Model PBR cần ánh sáng để hiển thị

### Model quá tối
→ Tăng intensity của light:
```tsx
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
```

### App lag khi load model
→ Model quá nặng. Giảm poly count hoặc dùng model đơn giản hơn.

---

## 📝 Example hoàn chỉnh

Xem file `src/components/Field3Dview.tsx` - đã có skeleton sẵn, chỉ cần uncomment và điền URL model.

Nếu cần demo nhanh, dùng model test này:
```
https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Box/glTF/Box.gltf
```

