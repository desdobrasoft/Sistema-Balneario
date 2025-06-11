class AppSizes {
  const AppSizes._();

  static const gap = _Sizes(xs: 2, sm: 4, md: 8, lg: 12, xl: 16, xxl: 20);
}

class _Sizes {
  const _Sizes({
    required this.xs,
    required this.sm,
    required this.md,
    required this.lg,
    required this.xl,
    required this.xxl,
  });

  final double xs;
  final double sm;
  final double md;
  final double lg;
  final double xl;
  final double xxl;
}
