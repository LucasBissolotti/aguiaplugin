# Small contrast checker for WCAG 2.1
# Usage: python contrast_check.py

def hex_to_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def srgb_to_linear(c):
    c = c / 255.0
    if c <= 0.03928:
        return c / 12.92
    return ((c + 0.055) / 1.055) ** 2.4

def rel_luminance(hexcolor):
    r, g, b = hex_to_rgb(hexcolor)
    R = srgb_to_linear(r)
    G = srgb_to_linear(g)
    B = srgb_to_linear(b)
    return 0.2126 * R + 0.7152 * G + 0.0722 * B

def contrast_ratio(a, b):
    La = rel_luminance(a)
    Lb = rel_luminance(b)
    L1 = max(La, Lb)
    L2 = min(La, Lb)
    return (L1 + 0.05) / (L2 + 0.05)

pairs = [
    ("#333333", "#ffffff", "text-dark on background-light"),
    ("#ffffff", "#0056b3", "white on primary (#0056b3)"),
    ("#ffffff", "#1a73e8", "white on secondary (#1a73e8)"),
    ("#ffffff", "#1976d2", "white on accent (#1976d2)"),
    ("#ffffff", "#0056b3", "white on save button (#0056b3)"),
    ("#ffffff", "#c0392b", "white on reset button (#c0392b)"),
    ("#333333", "#f5f9ff", "text-dark on hover-bg (#f5f9ff)"),
    ("#757575", "#ffffff", "disabled color on white (#757575)"),
    ("#2e7d32", "#ffffff", "success color on white (#2e7d32)"),
]

# Additional candidate colors to suggest fixes
candidates = [
    ("#ffffff", "#0056b3", "white on primary (#0056b3) - suggested for save button"),
    ("#ffffff", "#1a58cc", "white on hover/save darker (#1a58cc) - candidate"),
    ("#ffffff", "#c0392b", "white on darker red (#c0392b) - candidate for reset"),
    ("#ffffff", "#b71c1c", "white on very dark red (#b71c1c) - stronger candidate for reset"),
]

print("\nCandidate color checks (suggestions):\n")
for fg, bg, desc in candidates:
    ratio = contrast_ratio(fg, bg)
    ok_normal = ratio >= 4.5
    ok_large = ratio >= 3.0
    print(f"{desc}: fg={fg} bg={bg} -> ratio={ratio:.2f} | AA normal={'PASS' if ok_normal else 'FAIL'} | AA large={'PASS' if ok_large else 'FAIL'})")

# Check newly adjusted success color
print('\nAdjusted color checks:')
ratio_succ = contrast_ratio('#ffffff', '#2e7d32')
print(f"white on adjusted success (#2e7d32) -> ratio={ratio_succ:.2f} | AA normal={'PASS' if ratio_succ>=4.5 else 'FAIL'} | AA large={'PASS' if ratio_succ>=3.0 else 'FAIL'}")

print("WCAG contrast check (WCAG 2.1)\n")
for fg, bg, desc in pairs:
    ratio = contrast_ratio(fg, bg)
    ok_normal = ratio >= 4.5
    ok_large = ratio >= 3.0
    print(f"{desc}: fg={fg} bg={bg} -> ratio={ratio:.2f} | AA normal={'PASS' if ok_normal else 'FAIL'} | AA large={'PASS' if ok_large else 'FAIL'})")
