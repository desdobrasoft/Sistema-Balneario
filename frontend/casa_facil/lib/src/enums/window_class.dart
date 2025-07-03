enum WindowClass {
  compact,
  medium,
  expanded;

  factory WindowClass.fromWidth(num width) {
    if (width < 600) {
      return WindowClass.compact;
    } else if (width < 840) {
      return WindowClass.medium;
    }
    return WindowClass.expanded;
  }
}
