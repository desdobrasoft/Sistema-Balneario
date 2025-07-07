import 'dart:async' show FutureOr;

import 'package:flutter/material.dart';

enum _Variant { elevated, filled, outlined, text, tonal }

enum IconPlacement { left, top, right, bottom }

class AppButton extends StatefulWidget {
  final _Variant _variant;

  const AppButton({
    super.key,
    this.alignment = MainAxisAlignment.center,
    this.backgroundColor,
    this.foregroundColor,
    this.expand,
    this.fontSize,
    this.iconPlacement = IconPlacement.left,
    this.isLoading,
    this.padding,
    required this.onPressed,
    this.label,
    this.loadingWidget,
    this.icon,
    this.child,
  }) : _variant = _Variant.filled;

  const AppButton.elevated({
    super.key,
    this.alignment = MainAxisAlignment.center,
    this.backgroundColor,
    this.foregroundColor,
    this.expand,
    this.fontSize,
    this.iconPlacement = IconPlacement.left,
    this.isLoading,
    this.padding,
    required this.onPressed,
    this.label,
    this.loadingWidget,
    this.icon,
    this.child,
  }) : _variant = _Variant.elevated;

  const AppButton.outlined({
    super.key,
    this.alignment = MainAxisAlignment.center,
    this.backgroundColor,
    this.foregroundColor,
    this.expand,
    this.fontSize,
    this.iconPlacement = IconPlacement.left,
    this.isLoading,
    this.padding,
    required this.onPressed,
    this.label,
    this.loadingWidget,
    this.icon,
    this.child,
  }) : _variant = _Variant.outlined;

  const AppButton.text({
    super.key,
    this.alignment = MainAxisAlignment.center,
    this.expand,
    this.fontSize,
    this.foregroundColor,
    this.iconPlacement = IconPlacement.left,
    this.isLoading,
    this.padding,
    required this.onPressed,
    this.label,
    this.loadingWidget,
    this.icon,
    this.child,
  }) : backgroundColor = null,
       _variant = _Variant.text;

  const AppButton.tonal({
    super.key,
    this.alignment = MainAxisAlignment.center,
    this.backgroundColor,
    this.foregroundColor,
    this.expand,
    this.fontSize,
    this.iconPlacement = IconPlacement.left,
    this.isLoading,
    this.padding,
    required this.onPressed,
    this.label,
    this.loadingWidget,
    this.icon,
    this.child,
  }) : _variant = _Variant.tonal;

  final MainAxisAlignment alignment;
  final Color? backgroundColor;
  final Color? foregroundColor;
  final bool? expand;
  final double? fontSize;
  final IconPlacement iconPlacement;
  final bool? isLoading;
  final EdgeInsetsGeometry? padding;

  final FutureOr<void> Function()? onPressed;

  final String? label;
  final Widget? loadingWidget;
  final Widget? icon;
  final Widget? child;

  @override
  State<AppButton> createState() => _AppButtonState();
}

class _AppButtonState extends State<AppButton> {
  static const _indicatorNoLabelDimension = 24.0;
  static const _indicatorDimension = 18.0;
  static const _indicatorPadding = 3.0;
  static const _paddingHorizontal = 24.0;
  static const _paddingVertical = 3.0;
  static const _spacingHorizontal = 8.0;
  static const _spacingVertical = 2.0;

  late String _label;
  late Widget? _loadingWidget;
  late Widget? _icon;
  late IconPlacement _placement;
  late _Variant _variant;

  late ColorScheme _scheme;

  bool _isLoading = false;

  @override
  void initState() {
    super.initState();

    widget.backgroundColor;
    _label = widget.label ?? '';
    _loadingWidget = widget.loadingWidget;
    _icon = widget.icon;
    _placement = widget.iconPlacement;
    _variant = widget._variant;
  }

  @override
  Widget build(BuildContext context) {
    _scheme = ColorScheme.of(context);

    if (!_hasChild) {
      switch (_variant) {
        case _Variant.elevated:
          return IconButton(
            style: _getStyle(),
            onPressed: _handler,
            icon: _getIcon(),
          );
        case _Variant.filled:
          return IconButton.filled(
            style: _getStyle(),
            onPressed: _handler,
            icon: _getIcon(),
          );
        case _Variant.outlined:
          return IconButton.outlined(
            style: _getStyle(),
            onPressed: _handler,
            icon: _getIcon(),
          );
        case _Variant.text:
          return IconButton(
            style: _getStyle(),
            onPressed: _handler,
            icon: _getIcon(),
          );
        case _Variant.tonal:
          return IconButton.filledTonal(
            style: _getStyle(),
            onPressed: _handler,
            icon: _getIcon(),
          );
      }
    }

    switch (_variant) {
      case _Variant.elevated:
        return ElevatedButton(
          style: _getStyle(),
          onPressed: _handler,
          child: _getChild(),
        );
      case _Variant.filled:
        return FilledButton(
          style: _getStyle(),
          onPressed: _handler,
          child: _getChild(),
        );
      case _Variant.outlined:
        return OutlinedButton(
          style: _getStyle(),
          onPressed: _handler,
          child: _getChild(),
        );
      case _Variant.text:
        return TextButton(
          style: _getStyle(),
          onPressed: _handler,
          child: _getChild(),
        );
      case _Variant.tonal:
        return FilledButton.tonal(
          style: _getStyle(),
          onPressed: _handler,
          child: _getChild(),
        );
    }
  }

  Widget _getChild() {
    final Axis direction;
    final double spacing;
    final TextDirection? horizontalDirection;
    final VerticalDirection verticalDirection;

    EdgeInsetsGeometry? padding = widget.padding;

    if (_placement == IconPlacement.top || _placement == IconPlacement.bottom) {
      direction = Axis.vertical;
      padding =
          padding ??
          EdgeInsets.symmetric(
            horizontal: _paddingHorizontal,
            vertical: _paddingVertical,
          );
      spacing = _spacingVertical;
      horizontalDirection = null;
      verticalDirection = _placement == IconPlacement.top
          ? VerticalDirection.up
          : VerticalDirection.down;
    } else {
      direction = Axis.horizontal;
      padding = padding ?? EdgeInsets.symmetric(horizontal: _paddingHorizontal);
      spacing = _spacingHorizontal;
      horizontalDirection = _placement == IconPlacement.left
          ? TextDirection.rtl
          : TextDirection.ltr;
      verticalDirection = VerticalDirection.down;
    }

    return Padding(
      padding: padding,
      child: Flex(
        direction: direction,
        mainAxisAlignment: widget.alignment,
        mainAxisSize: widget.expand == true
            ? MainAxisSize.max
            : MainAxisSize.min,
        spacing: spacing,
        textDirection: horizontalDirection,
        verticalDirection: verticalDirection,
        children: [
          Flexible(
            child:
                widget.child ??
                Text(_label, style: TextStyle(fontSize: widget.fontSize)),
          ),
          if (_icon != null) _getIcon(),
        ],
      ),
    );
  }

  Widget _getIcon() {
    if (widget.isLoading ?? _isLoading) {
      if (_loadingWidget == null) {
        final dimension =
            widget.fontSize ??
            (_hasChild ? _indicatorDimension : _indicatorNoLabelDimension);

        return SizedBox.square(
          dimension: dimension,
          child: CircularProgressIndicator(
            color: _fg,
            padding: EdgeInsets.all(_indicatorPadding),
            strokeWidth: dimension * 0.1,
          ),
        );
      }

      return _loadingWidget!;
    }

    return _icon ?? SizedBox();
  }

  ButtonStyle _getStyle() {
    return switch (_variant) {
      _Variant.elevated => ElevatedButton.styleFrom(
        backgroundColor: widget.backgroundColor,
        foregroundColor: _fg,
        padding: EdgeInsets.zero,
      ),
      _Variant.filled => FilledButton.styleFrom(
        backgroundColor: widget.backgroundColor,
        foregroundColor: _fg,
        padding: EdgeInsets.zero,
      ),
      _Variant.outlined => OutlinedButton.styleFrom(
        backgroundColor: widget.backgroundColor,
        foregroundColor: _fg,
        padding: EdgeInsets.zero,
      ),
      _Variant.text => TextButton.styleFrom(
        backgroundColor: widget.backgroundColor,
        foregroundColor: _fg,
        padding: EdgeInsets.zero,
      ),
      _Variant.tonal => FilledButton.styleFrom(
        backgroundColor: widget.backgroundColor,
        foregroundColor: _fg,
        padding: EdgeInsets.zero,
      ),
    };
  }

  Color get _fg =>
      widget.foregroundColor ??
      switch (_variant) {
        _Variant.elevated => _scheme.primary,
        _Variant.filled => _scheme.onPrimary,
        _Variant.outlined => _scheme.onSurfaceVariant,
        _Variant.text => _scheme.primary,
        _Variant.tonal => _scheme.onSecondaryContainer,
      };

  bool get _hasChild => widget.child != null || _label.isNotEmpty;

  Future<void> Function()? get _handler =>
      widget.onPressed == null ? null : _onPressed;

  Future<void> _onPressed() async {
    if (widget.isLoading != null) {
      setState(() => _isLoading = true);
    }

    try {
      final result = widget.onPressed?.call() as Future;
      await result;
    } catch (_) {
      // Catch apenas para evitar erros na aplicação quando onPressed não for Future.
    } finally {
      if (widget.isLoading != null) {
        setState(() => _isLoading = false);
      }
    }
  }
}
