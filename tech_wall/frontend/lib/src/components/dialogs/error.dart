import 'package:flutter/material.dart';
import 'package:tech_wall/src/components/app_button.dart';
import 'package:tech_wall/src/components/dialogs/interface.dart';
import 'package:tech_wall/src/components/dialogs/utils/get_content_style.dart';
import 'package:tech_wall/src/constants/constants.dart'
    show defaultErrorMessage, gapmd, gapsm;

/// Exibe uma caixa de diálogo indicando um erro.
///
/// [message] - Mensagem a ser exibida na caixa de diálogo. Se for nulo [Constants.defaultErrorMessage] será exibida.
///
/// [detalhes] - Se não for nulo, será gerada uma caixa expansível (fechada por padrão)
/// para indicar detalhes do erro.
class ErrorDialog extends StatefulWidget implements DialogInterface {
  const ErrorDialog({super.key, this.message, this.detalhes});

  final String? message;
  final String? detalhes;

  @override
  State<ErrorDialog> createState() => _ErrorDialogState();
}

class _ErrorDialogState extends State<ErrorDialog> {
  late ColorScheme _scheme;
  late TextStyle? _style;

  @override
  Widget build(BuildContext context) {
    _scheme = ColorScheme.of(context);
    _style = contentStyle(context);

    return AlertDialog(
      scrollable: true,
      title: Row(
        children: [
          Icon(Icons.error_outline, color: _scheme.error),
          SizedBox(width: gapsm),
          Text('Erro', style: TextStyle(color: _scheme.error)),
        ],
      ),
      content: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(widget.message ?? defaultErrorMessage, style: _style),
          Builder(
            builder: (context) {
              final showDetails = ValueNotifier(false);
              if (widget.detalhes?.isNotEmpty ?? false) {
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    ValueListenableBuilder(
                      valueListenable: showDetails,
                      builder: (context, show, _) {
                        if (show && widget.detalhes != null) {
                          return Container(
                            alignment: Alignment.centerLeft,
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(20),
                              color: _scheme.surfaceContainerHighest,
                            ),
                            margin: EdgeInsets.only(top: gapmd),
                            padding: EdgeInsets.all(gapmd),
                            child: Text(widget.detalhes ?? '', style: _style),
                          );
                        }
                        return const SizedBox();
                      },
                    ),
                    InkWell(
                      focusColor: Colors.transparent,
                      highlightColor: Colors.transparent,
                      hoverColor: Colors.transparent,
                      splashFactory: NoSplash.splashFactory,
                      onTap: () => showDetails.value = !showDetails.value,
                      child: ValueListenableBuilder(
                        valueListenable: showDetails,
                        builder: (context, show, _) {
                          return Row(
                            children: [
                              Text(
                                '${show ? 'Menos' : 'Mais'} detalhes',
                                style: _style?.copyWith(color: _scheme.primary),
                              ),
                              ExpandIcon(
                                disabledColor: _scheme.primary,
                                isExpanded: show,
                                padding: EdgeInsets.zero,
                                onPressed: null,
                              ),
                            ],
                          );
                        },
                      ),
                    ),
                  ],
                );
              }
              return const SizedBox();
            },
          ),
        ],
      ),
      actions: [AppButton(onPressed: _onPressed, child: const Text('Ok'))],
    );
  }

  Future<void> _onPressed() async {
    Navigator.of(context).pop();
  }
}
