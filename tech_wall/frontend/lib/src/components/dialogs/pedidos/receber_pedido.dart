import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:tech_wall/src/api/pedidos_compra/dto.dart';
import 'package:tech_wall/src/api/pedidos_compra/pedidos_compra.dart';
import 'package:tech_wall/src/components/app_button.dart';
import 'package:tech_wall/src/components/dialogs/interface.dart';
import 'package:tech_wall/src/constants/constants.dart';
import 'package:tech_wall/src/models/pedido_compra.dart';

class ReceberPedidoDialog extends StatefulWidget implements DialogInterface {
  const ReceberPedidoDialog({super.key, required this.pedido});
  final PedidoCompraModel pedido;

  @override
  State<ReceberPedidoDialog> createState() => _ReceberPedidoDialogState();
}

class _ReceberPedidoDialogState extends State<ReceberPedidoDialog> {
  final _formKey = GlobalKey<FormState>();
  final _isPressed = ValueNotifier(false);
  final _qtdeController = TextEditingController();
  StatusRecebimento _status = StatusRecebimento.entregue;

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text('Receber Pedido #${widget.pedido.id}'),
      content: Form(
        key: _formKey,
        child: SizedBox(
          width: 400,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            spacing: gaplg,
            children: [
              Text('Material: ${widget.pedido.material.item}'),
              Text('Quantidade Solicitada: ${widget.pedido.qtSolicitada}'),
              const Divider(),
              SegmentedButton<StatusRecebimento>(
                segments: const [
                  ButtonSegment(
                    value: StatusRecebimento.entregue,
                    label: Text('Entregue Conforme'),
                  ),
                  ButtonSegment(
                    value: StatusRecebimento.entregueComAlteracao,
                    label: Text('Entregue com Alteração'),
                  ),
                ],
                selected: {_status},
                onSelectionChanged: (s) => setState(() => _status = s.first),
              ),
              if (_status == StatusRecebimento.entregueComAlteracao)
                TextFormField(
                  controller: _qtdeController,
                  autofocus: true,
                  decoration: const InputDecoration(
                    labelText: 'Quantidade Realmente Entregue',
                    filled: true,
                  ),
                  keyboardType: TextInputType.number,
                  inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                  validator: (v) => (int.tryParse(v ?? '0') ?? 0) <= 0
                      ? 'Quantidade inválida'
                      : null,
                ),
            ],
          ),
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
            label: 'Confirmar Recebimento',
            onPressed: _onPressedConfirmar,
          ),
        ),
      ],
    );
  }

  Future<void> _onPressedConfirmar() async {
    if (!_formKey.currentState!.validate()) return;
    if (_isPressed.value) return;
    _isPressed.value = true;

    final dto = ReceberPedidoDto(
      status: _status,
      qtEntregue: int.tryParse(_qtdeController.text),
    );
    final success = await PedidosCompraApi.receber(widget.pedido.id, dto);

    _isPressed.value = false;
    if (success && mounted) Navigator.of(context).pop(true);
  }
}
