import 'package:casa_facil/src/api/producao/dto.dart';
import 'package:casa_facil/src/api/producao/producao.dart';
import 'package:casa_facil/src/components/app_button.dart';
import 'package:casa_facil/src/components/dialogs/interface.dart';
import 'package:casa_facil/src/constants/constants.dart';
import 'package:casa_facil/src/models/ordem_producao.dart';
import 'package:casa_facil/src/models/status_producao.dart';
import 'package:flutter/material.dart';

class UpdateStatusProducaoDialog extends StatefulWidget
    implements DialogInterface {
  const UpdateStatusProducaoDialog({super.key, required this.ordem});
  final OrdemProducaoModel ordem;

  @override
  State<UpdateStatusProducaoDialog> createState() =>
      _UpdateStatusProducaoDialogState();
}

class _UpdateStatusProducaoDialogState
    extends State<UpdateStatusProducaoDialog> {
  final _isPressed = ValueNotifier(false);
  final _notasController = TextEditingController();
  late StatusProducao _selectedStatus;

  @override
  void initState() {
    super.initState();
    _selectedStatus = widget.ordem.status;
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text('Alterar Status (Venda #${widget.ordem.venda.id})'),
      content: SizedBox(
        width: 400,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          spacing: gaplg,
          children: [
            DropdownButtonFormField<StatusProducao>(
              value: _selectedStatus,
              decoration: const InputDecoration(
                labelText: 'Novo Status',
                filled: true,
              ),
              items: StatusProducao.values
                  .map(
                    (s) =>
                        DropdownMenuItem(value: s, child: Text(s.description)),
                  )
                  .toList(),
              onChanged: (value) {
                if (value != null) setState(() => _selectedStatus = value);
              },
            ),
            TextFormField(
              controller: _notasController,
              decoration: const InputDecoration(
                labelText: 'Notas da Alteração (Opcional)',
                filled: true,
                hintText: 'Ex: Todos os materiais foram alocados.',
              ),
              maxLines: 3,
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
            label: 'Confirmar',
            onPressed: _onPressedConfirmar,
          ),
        ),
      ],
    );
  }

  Future<void> _onPressedConfirmar() async {
    if (_isPressed.value) return;
    _isPressed.value = true;

    final dto = UpdateOrdemProducaoDto(
      status: _selectedStatus,
      notas: _notasController.text,
    );

    final success = await ProducaoApi.update(widget.ordem.id, dto);

    _isPressed.value = false;
    if (success && mounted) Navigator.of(context).pop(true);
  }
}
