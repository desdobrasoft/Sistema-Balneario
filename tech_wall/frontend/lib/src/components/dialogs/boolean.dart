import 'dart:async';

import 'package:flutter/material.dart';
import 'package:tech_wall/src/components/app_button.dart';
import 'package:tech_wall/src/components/dialogs/interface.dart';
import 'package:tech_wall/src/components/dialogs/utils/get_content_style.dart';

class BooleanDialog extends StatefulWidget implements DialogInterface {
  const BooleanDialog({
    super.key,
    this.title,
    this.content,
    this.trueLabel,
    this.falseLabel,
  });

  final String? title;
  final String? content;
  final String? trueLabel;
  final String? falseLabel;

  @override
  State<BooleanDialog> createState() => _BooleanDialogState();
}

class _BooleanDialogState extends State<BooleanDialog> {
  late final TextStyle? _style;

  @override
  Widget build(BuildContext context) {
    _style = contentStyle(context);

    return AlertDialog(
      scrollable: true,
      title: widget.title == null ? null : Text(widget.title!),
      content: widget.content != null
          ? Text(widget.content!, style: _style)
          : null,
      actions: [
        AppButton.text(
          onPressed: () => _handler(false),
          child: Text(
            (widget.falseLabel ?? '').isEmpty ? 'Não' : widget.falseLabel!,
          ),
        ),
        AppButton(
          onPressed: () => _handler(true),
          child: Text(
            (widget.trueLabel ?? '').isEmpty ? 'Sim' : widget.trueLabel!,
          ),
        ),
      ],
    );
  }

  Future<void> _handler(bool value) async {
    Navigator.of(context).pop(value);
  }
}
