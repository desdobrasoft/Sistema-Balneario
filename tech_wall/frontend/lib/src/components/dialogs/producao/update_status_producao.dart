import 'package:flutter/material.dart';
import 'package:intl/intl.dart' show DateFormat;
import 'package:tech_wall/src/api/producao/dto.dart';
import 'package:tech_wall/src/api/producao/producao.dart';
import 'package:tech_wall/src/components/app_button.dart';
import 'package:tech_wall/src/components/dialogs/interface.dart';
import 'package:tech_wall/src/constants/constants.dart';
import 'package:tech_wall/src/models/historico_producao.dart';
import 'package:tech_wall/src/models/ordem_producao.dart';
import 'package:tech_wall/src/models/status_producao.dart';

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

  /// Constrói a seção que exibe o histórico de status.
  Widget _buildHistorySection(List<HistoricoProducao> historico) {
    final theme = Theme.of(context);
    if (historico.isEmpty) {
      return const Text('Nenhum histórico de status para exibir.');
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Histórico de Status', style: theme.textTheme.titleMedium),
        const SizedBox(height: gapmd),
        // Container com altura fixa e borda para a lista rolável
        Container(
          height: 150.0, // Altura moderada
          decoration: BoxDecoration(
            border: Border.all(color: theme.colorScheme.outlineVariant),
            borderRadius: BorderRadius.circular(8.0),
          ),
          child: ListView.separated(
            itemCount: historico.length,
            separatorBuilder: (_, _) => const Divider(height: 1),
            itemBuilder: (context, index) {
              final item = historico[index];
              final dataFormatada = item.dataAlteracao?.isNotEmpty == true
                  ? DateFormat(
                      'dd/MM/yyyy HH:mm',
                    ).format(DateTime.parse(item.dataAlteracao!))
                  : '';

              return ListTile(
                title: Text.rich(
                  TextSpan(
                    style: theme.textTheme.bodyMedium,
                    children: [
                      // Mostra o status anterior, se existir
                      if (item.statusAnterior != null) ...[
                        TextSpan(
                          text: item.statusAnterior!.description,
                          style: const TextStyle(
                            decoration: TextDecoration.lineThrough,
                          ),
                        ),
                        const WidgetSpan(
                          child: Icon(
                            Icons.arrow_right_alt,
                            size: 16,
                            color: Colors.grey,
                          ),
                        ),
                      ],
                      // Mostra o status novo em negrito
                      TextSpan(
                        text: ' ${item.statusNovo.description}',
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
                subtitle: Text.rich(
                  TextSpan(
                    style: TextStyle(fontFamily: 'RobotoMono'),
                    children: [
                      // Data da alteração
                      if (dataFormatada.isNotEmpty)
                        TextSpan(text: '$dataFormatada: '),
                      // Notas, se existirem
                      if (item.notas?.isNotEmpty == true)
                        TextSpan(text: item.notas!),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
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
              initialValue: _selectedStatus,
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
            const Divider(height: gaplg),
            // Seção do histórico de status, agora usando os dados diretos
            _buildHistorySection(widget.ordem.historicoProducao),
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
