# 🎨 Hướng dẫn Load Texture cho Model 3D

## 📦 Cách 1: Load texture riêng và apply lên model (ĐÃ IMPLEMENT)

Component hiện tại đã được setup để:
1. ✅ Load file GLTF model từ assets
2. ✅ Load texture PNG riêng từ assets
3. ✅ Apply texture lên tất cả mesh trong model
4. ✅ Fallback về sân phẳng nếu lỗi

### Code hiện tại:

```tsx
// Load texture riêng
const textureAsset = Asset.fromModule(require('../../assets/football_field/textures/football_field_baseColor.png'));
await textureAsset.downloadAsync();

const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load(textureAsset.localUri || textureAsset.uri);

// Apply lên model
gltf.scene.traverse((child: any) => {
  if (child.isMesh) {
    child.material = new THREE.MeshStandardMaterial({ 
      map: texture,      // Texture chính
      color: 0xffffff,   // Màu trắng để texture hiển thị đúng
      roughness: 0.8,
      metalness: 0.1,
    });
  }
});
```

---

## 🎯 Cách 2: Apply texture lên mesh cụ thể (theo tên)

Nếu model có nhiều phần và bạn muốn apply texture khác nhau:

```tsx
gltf.scene.traverse((child: any) => {
  if (child.isMesh) {
    // Apply texture theo tên mesh
    if (child.name === 'Ground' || child.name === 'Field') {
      child.material = new THREE.MeshStandardMaterial({ 
        map: grassTexture,
        roughness: 0.9,
      });
    } else if (child.name === 'Lines') {
      child.material = new THREE.MeshBasicMaterial({ 
        color: 0xffffff,  // Vạch trắng
      });
    }
  }
});
```

---

## 🎨 Cách 3: Load nhiều texture (diffuse, normal, roughness...)

```tsx
// Load nhiều texture
const textureLoader = new THREE.TextureLoader();

const baseColorTexture = textureLoader.load(baseColorAsset.localUri);
const normalTexture = textureLoader.load(normalAsset.localUri);
const roughnessTexture = textureLoader.load(roughnessAsset.localUri);

// Apply tất cả
gltf.scene.traverse((child: any) => {
  if (child.isMesh) {
    child.material = new THREE.MeshStandardMaterial({ 
      map: baseColorTexture,           // Base color
      normalMap: normalTexture,        // Normal map (độ gồ ghề)
      roughnessMap: roughnessTexture,  // Roughness map
      metalness: 0.1,
    });
  }
});
```

---

## 🔧 Cách 4: Tạo texture từ màu thuần (không cần file)

```tsx
// Không cần load file, dùng màu
gltf.scene.traverse((child: any) => {
  if (child.isMesh) {
    child.material = new THREE.MeshStandardMaterial({ 
      color: 0x2d5016,  // Màu xanh cỏ
      roughness: 0.8,
      metalness: 0.2,
    });
  }
});
```

---

## 🎨 Cách 5: Tạo texture pattern bằng Canvas

```tsx
// Tạo canvas texture (pattern cỏ)
function createGrassTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  // Vẽ pattern
  ctx.fillStyle = '#2d5016';
  ctx.fillRect(0, 0, 512, 512);
  
  // Thêm chi tiết
  for (let i = 0; i < 100; i++) {
    ctx.fillStyle = '#1a3010';
    ctx.fillRect(
      Math.random() * 512,
      Math.random() * 512,
      Math.random() * 10,
      Math.random() * 10
    );
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  
  return texture;
}

// Dùng
const grassTexture = createGrassTexture();
child.material = new THREE.MeshStandardMaterial({ map: grassTexture });
```

**Lưu ý:** Canvas trong React Native cần package `react-native-canvas` hoặc dùng WebView.

---

## 🎯 Cách 6: Load texture từ URL (online)

```tsx
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load(
  'https://your-cdn.com/textures/grass.png',
  () => console.log('Loaded'),
  undefined,
  (err) => console.error('Error:', err)
);

gltf.scene.traverse((child: any) => {
  if (child.isMesh) {
    child.material = new THREE.MeshStandardMaterial({ map: texture });
  }
});
```

---

## 🔧 Điều chỉnh Texture

### Repeat (lặp lại texture)
```tsx
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set(2, 2);  // Lặp 2x2
```

### Rotation (xoay texture)
```tsx
texture.rotation = Math.PI / 4;  // Xoay 45 độ
texture.center.set(0.5, 0.5);    // Tâm xoay
```

### Offset (dịch chuyển texture)
```tsx
texture.offset.set(0.5, 0.5);  // Dịch 50%
```

### Flip (lật texture)
```tsx
texture.flipY = false;  // Không lật theo Y
```

---

## 🐛 Troubleshooting

### Texture không hiển thị
→ Kiểm tra:
1. File texture có tồn tại không?
2. `color` có phải `0xffffff` không? (màu trắng)
3. Ánh sáng có đủ không?

```tsx
// Debug: in ra tên các mesh
gltf.scene.traverse((child: any) => {
  if (child.isMesh) {
    console.log('Mesh name:', child.name);
    console.log('Has material:', !!child.material);
  }
});
```

### Texture bị mờ/pixelated
→ Tăng filter:
```tsx
texture.minFilter = THREE.LinearMipmapLinearFilter;
texture.magFilter = THREE.LinearFilter;
texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
```

### Texture bị ngược/lật
→ Flip texture:
```tsx
texture.flipY = !texture.flipY;
```

### Texture load chậm
→ Dùng loading callback:
```tsx
textureLoader.load(
  textureUri,
  (texture) => {
    console.log('✅ Loaded');
    applyTexture(texture);
  },
  (progress) => {
    console.log('Loading:', progress.loaded / progress.total * 100 + '%');
  },
  (error) => {
    console.error('❌ Error:', error);
  }
);
```

---

## 📝 Best Practices

1. **Optimize texture size:**
   - Dùng 512x512 hoặc 1024x1024
   - Không dùng quá 2048x2048 (lag trên mobile)

2. **Format:**
   - PNG cho transparency
   - JPG cho texture không trong suốt (nhẹ hơn)

3. **Compression:**
   - Nén texture trước khi bundle vào app
   - Dùng tools như TinyPNG

4. **Caching:**
   - Three.js tự cache texture
   - Không cần load lại nhiều lần

5. **Memory:**
   - Dispose texture khi không dùng:
   ```tsx
   texture.dispose();
   material.dispose();
   geometry.dispose();
   ```

---

## 🎨 Ví dụ hoàn chỉnh

Xem file `src/components/Field3Dview.tsx` - đã implement load texture từ assets và apply lên model.

Để test:
1. Reload app
2. Vào RoomDetail
3. Sẽ thấy model với texture từ `assets/football_field/textures/`

---

## 📚 Tài liệu tham khảo

- [Three.js Texture Documentation](https://threejs.org/docs/#api/en/textures/Texture)
- [Three.js TextureLoader](https://threejs.org/docs/#api/en/loaders/TextureLoader)
- [Material Maps Guide](https://threejs.org/docs/#api/en/materials/MeshStandardMaterial)


