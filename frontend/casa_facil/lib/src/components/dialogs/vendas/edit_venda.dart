import 'package:casa_facil/src/api/vendas/dto.dart';
import 'package:casa_facil/src/api/vendas/vendas.dart';
import 'package:casa_facil/src/components/app_button.dart';
import 'package:casa_facil/src/components/dialogs/interface.dart';
import 'package:casa_facil/src/constants/constants.dart' show gaplg;
import 'package:casa_facil/src/models/status_pagamento.dart';
import 'package:casa_facil/src/models/status_venda.dart';
import 'package:casa_facil/src/models/venda.dart';
import 'package:flutter/material.dart';

class UpdateVendaStatusDialog extends StatefulWidget
    implements DialogInterface {
  const UpdateVendaStatusDialog({super.key, required this.venda});
  final VendaModel venda;

  @override
  State<UpdateVendaStatusDialog> createState() =>
      _UpdateVendaStatusDialogState();
}

class _UpdateVendaStatusDialogState extends State<UpdateVendaStatusDialog> {
  static const double _maxWidth = 400;
  final _isPressed = ValueNotifier(false);

  // Variáveis para guardar os valores selecionados nos dropdowns
  late StatusVenda _selectedStatusVenda;
  late StatusPagamento _selectedStatusPagamento;

  @override
  void initState() {
    super.initState();
    // Inicializa os dropdowns com os valores atuais da venda
    _selectedStatusVenda = widget.venda.statusVenda;
    _selectedStatusPagamento = widget.venda.statusPagamento;
  }

  @override
  void dispose() {
    _isPressed.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text('Alterar Status da Venda #${widget.venda.id}'),
      content: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: _maxWidth),
        child: SizedBox(
          width: double.maxFinite,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            spacing: gaplg,
            children: [
              // Dropdown para o Status da Venda (produção)
              DropdownButtonFormField<StatusVenda>(
                value: _selectedStatusVenda,
                decoration: const InputDecoration(
                  labelText: 'Status da Venda',
                  filled: true,
                ),
                items: StatusVenda.values.map((status) {
                  return DropdownMenuItem(
                    value: status,
                    child: Text(status.description),
                  );
                }).toList(),
                onChanged: (value) {
                  if (value != null) {
                    setState(() => _selectedStatusVenda = value);
                  }
                },
              ),
              // Dropdown para o Status do Pagamento
              DropdownButtonFormField<StatusPagamento>(
                value: _selectedStatusPagamento,
                decoration: const InputDecoration(
                  labelText: 'Status do Pagamento',
                  filled: true,
                ),
                items: StatusPagamento.values.map((status) {
                  return DropdownMenuItem(
                    value: status,
                    child: Text(status.description),
                  );
                }).toList(),
                onChanged: (value) {
                  if (value != null) {
                    setState(() => _selectedStatusPagamento = value);
                  }
                },
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

    // Cria o DTO com os novos valores selecionados
    final dto = UpdateVendaDto(
      status: _selectedStatusVenda,
      statusPagamento: _selectedStatusPagamento,
    );

    // Chama a API para atualizar a venda
    final success = await VendasApi.updateVenda(
      vendaId: widget.venda.id,
      dto: dto,
    );

    _isPressed.value = false;
    // Fecha o diálogo e retorna 'true' se a atualização foi bem-sucedida
    if (success && mounted) Navigator.of(context).pop(true);
  }
}
