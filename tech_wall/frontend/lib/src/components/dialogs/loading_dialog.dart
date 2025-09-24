import 'package:flutter/material.dart';
import 'package:tech_wall/src/components/dialogs/interface.dart';
import 'package:tech_wall/src/components/dialogs/utils/get_content_style.dart';
import 'package:tech_wall/src/constants/constants.dart' show gapmd;

class LoadingDialog extends StatefulWidget implements DialogInterface {
  const LoadingDialog({super.key, this.message});

  final String? message;

  @override
  State<LoadingDialog> createState() => _LoadingDialogState();
}

class _LoadingDialogState extends State<LoadingDialog> {
  @override
  Widget build(BuildContext context) {
    return BackButtonListener(
      onBackButtonPressed: () async => true,
      child: PopScope(
        canPop: false,
        child: AlertDialog(
          scrollable: true,

          title: Text('Aguarde'),
          content: Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            mainAxisSize: MainAxisSize.min,
            spacing: gapmd,
            children: [
              Flexible(
                child: Text(
                  widget.message ?? 'Carregando, por favor aguarde...',
                  style: contentStyle(context),
                ),
              ),
              CircularProgressIndicator(),
            ],
          ),
        ),
      ),
    );
  }
}
