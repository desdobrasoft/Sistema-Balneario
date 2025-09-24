import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:tech_wall/src/api/entregas/dto.dart';
import 'package:tech_wall/src/api/entregas/entregas.dart';
import 'package:tech_wall/src/components/app_button.dart';
import 'package:tech_wall/src/components/dialogs/interface.dart';
import 'package:tech_wall/src/constants/constants.dart';
import 'package:tech_wall/src/models/entrega.dart';
import 'package:tech_wall/src/models/status_entrega.dart';

class UpdateEntregaDialog extends StatefulWidget implements DialogInterface {
  const UpdateEntregaDialog({super.key, required this.entrega});
  final EntregaModel entrega;

  @override
  State<UpdateEntregaDialog> createState() => _UpdateEntregaDialogState();
}

class _UpdateEntregaDialogState extends State<UpdateEntregaDialog> {
  final _isPressed = ValueNotifier(false);
  final _transportadoraController = TextEditingController();
  final _dataController = TextEditingController();
  final _notasController = TextEditingController();

  late StatusEntrega _selectedStatus;
  DateTime? _selectedDate;

  @override
  void initState() {
    super.initState();
    _selectedStatus = widget.entrega.status;
    _transportadoraController.text = widget.entrega.transportadora ?? '';
    _selectedDate = DateTime.tryParse(widget.entrega.previsaoEntrega);
    if (_selectedDate != null) {
      _dataController.text = DateFormat('dd/MM/yyyy').format(_selectedDate!);
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text('Atualizar Entrega (Venda #${widget.entrega.venda.id})'),
      content: SizedBox(
        width: 500,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          spacing: gaplg,
          children: [
            DropdownButtonFormField<StatusEntrega>(
              initialValue: _selectedStatus,
              decoration: const InputDecoration(
                labelText: 'Status da Entrega',
                filled: true,
              ),
              items: StatusEntrega.values
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
              controller: _transportadoraController,
              decoration: const InputDecoration(
                labelText: 'Transportadora',
                filled: true,
              ),
            ),
            TextFormField(
              controller: _dataController,
              decoration: const InputDecoration(
                labelText: 'Nova Previsão de Entrega',
                filled: true,
                suffixIcon: Icon(Icons.calendar_today),
              ),
              readOnly: true,
              onTap: _selectDate,
            ),
            TextFormField(
              controller: _notasController,
              decoration: const InputDecoration(
                labelText: 'Notas da Alteração (Opcional)',
                filled: true,
              ),
              maxLines: 2,
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

  Future<void> _selectDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate ?? DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime(2100),
    );
    if (picked != null) {
      setState(() {
        _selectedDate = picked;
        _dataController.text = DateFormat('dd/MM/yyyy').format(picked);
      });
    }
  }

  Future<void> _onPressedConfirmar() async {
    if (_isPressed.value) return;
    _isPressed.value = true;

    final dto = UpdateEntregaDto(
      status: _selectedStatus,
      transportadora: _transportadoraController.text,
      previsaoEntrega: _selectedDate,
      notas: _notasController.text,
    );

    final success = await EntregasApi.update(widget.entrega.id, dto);

    _isPressed.value = false;
    if (success && mounted) Navigator.of(context).pop(true);
  }
}
