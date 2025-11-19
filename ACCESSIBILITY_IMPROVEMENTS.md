# Accessibility Color Improvements

**Issue:** Low contrast ratios in certain UI elements
**Priority:** Medium
**WCAG Target:** AA (4.5:1 for normal text, 3:1 for large text/UI components)

---

## Issues Found

### 1. Glass Effect Borders (Low Contrast)
**Current:**
```js
'glass-border': 'rgba(59, 130, 246, 0.2)'  // 20% opacity
```

**Problem:** Too transparent, hard to distinguish element boundaries

**Fix:** Increase opacity to 40-50%
```js
'glass-border': 'rgba(59, 130, 246, 0.4)'  // 40% opacity
```

---

### 2. Muted Text (Insufficient Contrast)
**Current:**
```css
--muted-foreground: 215 20.2% 65.1%;  /* Dark mode */
```

**Problem:** On dark blue backgrounds, this gray may not meet 4.5:1 ratio

**Fix:** Increase lightness to 75%
```css
--muted-foreground: 215 20.2% 75%;
```

---

### 3. Hero Subtitle Text
**Current:**
```jsx
<p className="text-lg text-gray-300">  // Tailwind gray-300
```

**Problem:** Gray-300 (#d1d5db) on blue-900 background ≈ 3.8:1 (fails WCAG AA)

**Fix:** Use gray-200 or white with reduced opacity
```jsx
<p className="text-lg text-gray-200">  // Better contrast
// OR
<p className="text-lg text-white/90">  // 90% white
```

---

### 4. Badge Colors
**Current:**
```jsx
<span className="bg-blue-500/20 text-blue-300 border-blue-500/30">
```

**Problem:** Blue-300 text on blue-500/20 background may have low contrast

**Fix:** Use blue-200 or increase background opacity
```jsx
<span className="bg-blue-500/30 text-blue-200 border-blue-500/50">
```

---

### 5. Glass Surface Opacity
**Current:**
```js
'glass-surface': 'rgba(30, 58, 138, 0.3)'  // 30% opacity
```

**Recommendation:** Increase to 40% for better distinction
```js
'glass-surface': 'rgba(30, 58, 138, 0.4)'
```

---

## Implementation Priority

### High Priority (Immediate)
1. ✅ Fix Hero subtitle text (text-gray-200)
2. ✅ Increase glass-border opacity (0.4)
3. ✅ Adjust badge text color (text-blue-200)

### Medium Priority
4. ⚠️ Increase muted-foreground lightness (75%)
5. ⚠️ Increase glass-surface opacity (0.4)

### Low Priority (Optional)
6. 📋 Add contrast checker to CI/CD
7. 📋 Implement dark mode toggle with high-contrast option

---

## Contrast Ratio Reference

| Element | Current | Target | Status |
|---------|---------|--------|--------|
| Hero subtitle | ~3.8:1 | 4.5:1 | ❌ Fail |
| Glass borders | ~2.5:1 | 3:1 | ❌ Fail |
| Badge text | ~4.0:1 | 4.5:1 | ⚠️ Borderline |
| Muted text | ~4.2:1 | 4.5:1 | ⚠️ Borderline |
| Primary text | >7:1 | 4.5:1 | ✅ Pass |

---

## Testing Tools

**Online:**
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Coolors Contrast Checker](https://coolors.co/contrast-checker)

**Browser Extensions:**
- axe DevTools
- WAVE Evaluation Tool
- Lighthouse (Chrome DevTools)

**Command:**
```bash
# Run Lighthouse accessibility audit
npm run lighthouse
```

---

## Quick Win: High Contrast Mode

Add a high-contrast theme variant:

```css
.high-contrast {
  --muted-foreground: 215 20.2% 85%;
  --border: 217.2 50% 35%;  /* More visible */
}
```

Apply: `<html className="dark high-contrast">`
