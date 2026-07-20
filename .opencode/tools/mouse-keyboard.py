import sys
import json

try:
    import pyautogui
except ImportError:
    print("ERROR: pyautogui not installed. Run: pip install pyautogui")
    sys.exit(1)

pyautogui.FAILSAFE = True

action = sys.argv[1] if len(sys.argv) > 1 else "help"

if action == "click":
    x = int(sys.argv[2]) if len(sys.argv) > 2 else 0
    y = int(sys.argv[3]) if len(sys.argv) > 3 else 0
    pyautogui.click(x=x, y=y)
    print(f"Clicked at ({x}, {y})")

elif action == "double_click":
    x = int(sys.argv[2]) if len(sys.argv) > 2 else 0
    y = int(sys.argv[3]) if len(sys.argv) > 3 else 0
    pyautogui.doubleClick(x=x, y=y)
    print(f"Double-clicked at ({x}, {y})")

elif action == "right_click":
    x = int(sys.argv[2]) if len(sys.argv) > 2 else 0
    y = int(sys.argv[3]) if len(sys.argv) > 3 else 0
    pyautogui.rightClick(x=x, y=y)
    print(f"Right-clicked at ({x}, {y})")

elif action == "move":
    x = int(sys.argv[2]) if len(sys.argv) > 2 else 0
    y = int(sys.argv[3]) if len(sys.argv) > 3 else 0
    dur = float(sys.argv[4]) if len(sys.argv) > 4 else 0.5
    pyautogui.moveTo(x=x, y=y, duration=dur)
    print(f"Moved to ({x}, {y})")

elif action == "drag":
    dx = int(sys.argv[2]) if len(sys.argv) > 2 else 100
    dy = int(sys.argv[3]) if len(sys.argv) > 3 else 0
    dur = float(sys.argv[4]) if len(sys.argv) > 4 else 0.5
    pyautogui.drag(dx=dx, dy=dy, duration=dur)
    print(f"Dragged by ({dx}, {dy})")

elif action == "scroll":
    clicks = int(sys.argv[2]) if len(sys.argv) > 2 else -3
    pyautogui.scroll(clicks)
    print(f"Scrolled {clicks} clicks")

elif action == "type":
    text = sys.argv[2] if len(sys.argv) > 2 else ""
    pyautogui.typewrite(text, interval=0.05)
    print(f"Typed: {text}")

elif action == "hotkey":
    keys = sys.argv[2].split("+") if len(sys.argv) > 2 else ["ctrl", "c"]
    pyautogui.hotkey(*keys)
    print(f"Pressed hotkey: {'+'.join(keys)}")

elif action == "press":
    key = sys.argv[2] if len(sys.argv) > 2 else "enter"
    pyautogui.press(key)
    print(f"Pressed key: {key}")

elif action == "screenshot":
    path = sys.argv[2] if len(sys.argv) > 2 else "screenshot.png"
    img = pyautogui.screenshot()
    img.save(path)
    print(f"Screenshot saved to {path}")

elif action == "position":
    pos = pyautogui.position()
    print(json.dumps({"x": pos.x, "y": pos.y}))

elif action == "size":
    size = pyautogui.size()
    print(json.dumps({"width": size.width, "height": size.height}))

elif action == "help":
    print("Usage: python mouse-keyboard.py <action> [args]")
    print("Actions:")
    print("  click <x> <y>        - Click at coordinates")
    print("  double_click <x> <y> - Double-click at coordinates")
    print("  right_click <x> <y>  - Right-click at coordinates")
    print("  move <x> <y> [dur]   - Move mouse to coordinates")
    print("  drag <dx> <dy> [dur] - Drag mouse by offset")
    print("  scroll <clicks>      - Scroll (negative=down)")
    print("  type <text>          - Type text")
    print("  hotkey <keys>        - Press hotkey (e.g. ctrl+c)")
    print("  press <key>          - Press a key")
    print("  screenshot [path]    - Take screenshot")
    print("  position             - Get mouse position")
    print("  size                 - Get screen size")

else:
    print(f"Unknown action: {action}")
    print("Run without args for help")
