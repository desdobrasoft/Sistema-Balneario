import 'package:casa_facil/src/components/dialogs/interface.dart';
import 'package:casa_facil/src/components/dialogs/utils/get_content_style.dart';
import 'package:casa_facil/src/constants/constants.dart' show gapmd;
import 'package:flutter/material.dart';

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
