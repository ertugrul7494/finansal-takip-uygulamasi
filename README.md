# 💰 Finansal Takip Uygulaması

Modern ve kullanıcı dostu React TypeScript tabanlı finansal takip uygulaması. Aylık giderlerinizi takip edin ve kredi kartlarınızı yönetin.

## 🚀 Özellikler

### 📊 Gider Takip Modülü
- ✅ Aylık gider ekleme ve listeleme
- ✅ 8 farklı kategori ile organize etme
- ✅ Toplam harcama hesaplama
- ✅ Gider silme özelliği
- ✅ Türk Lirası formatında görüntüleme

### 💳 Kredi Kartı Takip Modülü
- ✅ Kredi kartı ekleme ve yönetimi
- ✅ Kart limiti ve mevcut borç takibi
- ✅ Hesap kesim ve son ödeme tarihleri
- ✅ Ödeme uyarıları (3 gün öncesinden)
- ✅ Kart harcama ve ödeme işlemleri
- ✅ Kullanım oranı görselleştirmesi
- ✅ Çoklu banka desteği

## 🎨 Kategoriler

🛒 Market | 🚗 Ulaşım | 📄 Faturalar | 🍽️ Yemek
👔 Giyim | ⚕️ Sağlık | 🎮 Eğlence | 📋 Genel

## 🛠️ Teknolojiler

- **React 18** - Modern kullanıcı arayüzü
- **TypeScript** - Tip güvenliği
- **Vite** - Hızlı geliştirme ortamı
- **Modern CSS** - Gradient tasarım ve animasyonlar
- **Responsive Design** - Mobil uyumlu

## 📱 Kurulum ve Çalıştırma

1. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

2. **Geliştirme sunucusunu başlatın:**
   ```bash
   npm run dev
   ```

3. **Tarayıcınızda açın:**
   ```
   http://localhost:5173
   ```

## 🏗️ Proje Yapısı

```
src/
├── components/
│   ├── ExpenseTracker.tsx     # Ana bileşen (tab sistemi)
│   ├── ExpenseTracker.css     # Ana stil dosyası
│   ├── CreditCardManager.tsx  # Kredi kartı yönetimi
│   └── CreditCardManager.css  # Kredi kartı stilleri
├── App.tsx                    # Ana uygulama
└── App.css                    # Genel stiller
```

## 💡 Kullanım

### Gider Ekleme
1. "Giderler" sekmesine gidin
2. Gider açıklaması, miktar ve kategori seçin
3. "Gider Ekle" butonuna tıklayın

### Kredi Kartı Yönetimi
1. "Kredi Kartları" sekmesine gidin
2. "Yeni Kart Ekle" butonuna tıklayın
3. Kart bilgilerini doldurun
4. Karta harcama/ödeme işlemleri yapın

## 🔔 Uyarı Sistemi

Uygulama, kredi kartı son ödeme tarihlerinizi takip eder ve 3 gün öncesinden itibaren uyarı verir.

## 📱 Responsive Tasarım

Uygulama tüm cihazlarda (masaüstü, tablet, mobil) mükemmel görünecek şekilde tasarlanmıştır.

## 🎯 Gelecek Özellikler

- 📈 Harcama grafikleri
- 💾 Veri dışa aktarma
- 🔄 Otomatik yedekleme
- 📧 E-posta bildirimleri

---

**Geliştirici:** React + TypeScript + Vite ile geliştirilmiştir.
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
