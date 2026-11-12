// C# that the Windows shell (win-shell.js) compiles once per session.
// SGWin.Minimize minimizes every visible window owned by the given process
// ids. EnumWindows finds all top-level windows, not only a "main" one, and
// Store apps are found inside their ApplicationFrameWindow host. Hidden,
// minimized and cloaked windows are skipped.
export const NATIVE = `using System; using System.Text; using System.Runtime.InteropServices;
public static class SGWin {
  public delegate bool Each(IntPtr h, IntPtr l);
  [DllImport("user32.dll")] static extern bool EnumWindows(Each f, IntPtr l);
  [DllImport("user32.dll")] static extern bool EnumChildWindows(IntPtr p, Each f, IntPtr l);
  [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr h, out uint pid);
  [DllImport("user32.dll")] static extern bool IsWindowVisible(IntPtr h);
  [DllImport("user32.dll")] static extern bool IsIconic(IntPtr h);
  [DllImport("user32.dll")] static extern bool ShowWindowAsync(IntPtr h, int n);
  [DllImport("user32.dll", CharSet = CharSet.Unicode)] static extern int GetClassName(IntPtr h, StringBuilder s, int n);
  [DllImport("dwmapi.dll")] static extern int DwmGetWindowAttribute(IntPtr h, int a, out int v, int s);
  static bool Owned(uint[] ids, IntPtr h) { uint p; GetWindowThreadProcessId(h, out p); return Array.IndexOf(ids, p) >= 0; }
  static bool Cloaked(IntPtr h) { int v; return DwmGetWindowAttribute(h, 14, out v, 4) == 0 && v != 0; }
  public static int Minimize(uint[] ids) {
    int count = 0;
    EnumWindows((h, l) => {
      if (!IsWindowVisible(h) || IsIconic(h) || Cloaked(h)) return true;
      bool hit = Owned(ids, h);
      var cls = new StringBuilder(64);
      GetClassName(h, cls, 64);
      if (!hit && cls.ToString() == "ApplicationFrameWindow")
        EnumChildWindows(h, (c, m) => { if (Owned(ids, c)) { hit = true; return false; } return true; }, IntPtr.Zero);
      if (hit) { ShowWindowAsync(h, 6); count++; }
      return true;
    }, IntPtr.Zero);
    return count;
  }
}`;
