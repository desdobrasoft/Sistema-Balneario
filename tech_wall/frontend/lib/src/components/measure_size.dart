import 'dart:async' show FutureOr;

import 'package:flutter/widgets.dart';

class MeasureSize extends StatefulWidget {
  final Widget child;
  final FutureOr<void> Function(Size? size) onChange;

  const MeasureSize({super.key, required this.child, required this.onChange});

  @override
  State<MeasureSize> createState() => _MeasureSizeState();
}

class _MeasureSizeState extends State<MeasureSize> {
  Size? oldSize;

  @override
  Widget build(BuildContext context) {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final contextSize = context.size;
      if (contextSize != oldSize) {
        oldSize = contextSize;
        widget.onChange(contextSize);
      }
    });

    return widget.child;
  }
}
