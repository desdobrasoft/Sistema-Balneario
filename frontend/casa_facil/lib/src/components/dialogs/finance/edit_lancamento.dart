import 'package:casa_facil/src/api/lancamentos/dto.dart';
import 'package:casa_facil/src/api/lancamentos/lancamentos.dart';
import 'package:casa_facil/src/components/app_button.dart';
import 'package:casa_facil/src/components/dialogs/interface.dart';
import 'package:casa_facil/src/constants/constants.dart';
import 'package:casa_facil/src/models/lancamento.dart';
import 'package:casa_facil/src/utils/formatador_moeda.dart';
import 'package:flutter/material.dart';

class EditLancamentoDialog extends StatefulWidget implements DialogInterface {
  const EditLancamentoDialog({super.key, required this.lancamento});
  final LancamentoModel lancamento;

  @override
  State<EditLancamentoDialog> createState() => _EditLancamentoDialogState();
}

class _EditLancamentoDialogState extends State<EditLancamentoDialog> {
  final _isPressed = ValueNotifier(false);
  final _valorPagoController = TextEditingController(text: '0,00');

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text('Registrar Pagamento / Editar'),
      content: SizedBox(
        width: 400,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          spacing: gaplg,
          children: [
            Text('Lançamento: ${widget.lancamento.descricao}'),
            Text(
              'Valor Pendente: R\$ ${widget.lancamento.valorPendente.toStringAsFixed(2).replaceAll('.', ',')}',
            ),
            Divider(height: gaplg),
            TextFormField(
              controller: _valorPagoController,
              autofocus: true,
              decoration: const InputDecoration(
                labelText: 'Valor a Pagar Agora',
                filled: true,
                prefixText: 'R\$ ',
              ),
              keyboardType: TextInputType.number,
              inputFormatters: [CurrencyInputFormatter()],
            ),
          ],
        ),
      ),
      actions: [
        AppButton.text(
          label: 'Cancelar',
          onPressed: () => Navigator.of(context).pop(),
        ),
        ValueListenableBuilder(
          valueListenable: _isPressed,
          builder: (context, pressed, _) => AppButton(
            isLoading: pressed,
            label: 'Confirmar Pagamento',
            onPressed: _onPressedConfirmar,
          ),
        ),
      ],
    );
  }

  Future<void> _onPressedConfirmar() async {
    if (_isPressed.value) return;
    final valorPago =
        double.tryParse(_valorPagoController.text.replaceAll(',', '.')) ?? 0;
    if (valorPago <= 0) return;

    _isPressed.value = true;
    final dto = UpdateLancamentoDto(valorPago: valorPago);
    final success = await LancamentosApi.update(widget.lancamento.id, dto);
    _isPressed.value = false;
    if (success && mounted) Navigator.of(context).pop(true);
  }
}
