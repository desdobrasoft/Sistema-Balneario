import 'package:flutter/material.dart';
import 'package:intl/intl.dart' show DateFormat;
import 'package:tech_wall/src/api/materiais_estoque/materiais_estoque.dart';
import 'package:tech_wall/src/api/producao/dto.dart';
import 'package:tech_wall/src/api/producao/producao.dart';
import 'package:tech_wall/src/components/app_button.dart';
import 'package:tech_wall/src/components/dialogs/interface.dart';
import 'package:tech_wall/src/constants/constants.dart';
import 'package:tech_wall/src/models/historico_producao.dart';
import 'package:tech_wall/src/models/materiais_estoque.dart';
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

  // Novos estados para controle de estoque
  late Future<List<MateriaisEstoqueModel>> _materiaisEstoqueFuture;
  bool _temEstoqueSuficiente = false;
  List<String> _materiaisFaltantes = [];

  @override
  void initState() {
    super.initState();
    _selectedStatus = widget.ordem.status;
    // Inicia a busca pelos materiais em estoque
    _materiaisEstoqueFuture = MateriaisEstoqueApi.listAll();
  }

  /// Verifica se há estoque suficiente para a produção.
  void _verificarEstoque(List<MateriaisEstoqueModel> materiaisEmEstoque) {
    final materiaisNecessarios = widget.ordem.venda.modelo?.materiais ?? [];
    List<String> faltantes = [];
    bool temEstoque = true;

    for (final necessario in materiaisNecessarios) {
      try {
        final emEstoque = materiaisEmEstoque.firstWhere(
          (e) => e.id == necessario.material.id,
        );

        if (emEstoque.qtEstoque < necessario.qtModelo) {
          temEstoque = false;
          final diff = necessario.qtModelo - emEstoque.qtEstoque;
          faltantes.add('${necessario.material.nome} (faltam $diff)');
        }
      } catch (e) {
        // Caso o material nem exista no estoque
        temEstoque = false;
        faltantes.add(
          '${necessario.material.nome} (faltam ${necessario.qtModelo})',
        );
      }
    }

    // Atualiza o estado sem chamar setState, pois o FutureBuilder irá reconstruir
    _temEstoqueSuficiente = temEstoque;
    _materiaisFaltantes = faltantes;
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
        Container(
          height: 150.0,
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
                      TextSpan(
                        text: ' ${item.statusNovo.description}',
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
                subtitle: Text.rich(
                  TextSpan(
                    style: const TextStyle(fontFamily: 'RobotoMono'),
                    children: [
                      if (dataFormatada.isNotEmpty)
                        TextSpan(text: '$dataFormatada: '),
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

  /// Constrói o aviso de estoque insuficiente.
  Widget _buildStockWarning() {
    if (_temEstoqueSuficiente) return const SizedBox.shrink();

    return Card(
      color: Theme.of(context).colorScheme.errorContainer,
      child: ListTile(
        leading: Icon(
          Icons.warning_amber_rounded,
          color: Theme.of(context).colorScheme.onErrorContainer,
        ),
        title: Text(
          'Estoque Insuficiente',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            color: Theme.of(context).colorScheme.onErrorContainer,
          ),
        ),
        subtitle: Text(
          'Faltam: ${_materiaisFaltantes.join(', ')}.',
          style: TextStyle(
            color: Theme.of(context).colorScheme.onErrorContainer,
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text('Alterar Status (Venda #${widget.ordem.venda.id})'),
      content: SizedBox(
        width: 400,
        child: FutureBuilder<List<MateriaisEstoqueModel>>(
          future: _materiaisEstoqueFuture,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator());
            }

            if (snapshot.hasError || !snapshot.hasData) {
              return const Center(
                child: Text('Erro ao carregar dados do estoque.'),
              );
            }

            // Realiza a verificação do estoque com os dados carregados
            _verificarEstoque(snapshot.data!);

            return Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Adiciona o aviso de estoque se necessário
                _buildStockWarning(),
                const SizedBox(height: gaplg),
                DropdownButtonFormField<StatusProducao>(
                  value: _selectedStatus,
                  decoration: const InputDecoration(
                    labelText: 'Novo Status',
                    filled: true,
                  ),
                  items: StatusProducao.values
                      .map(
                        (s) => DropdownMenuItem(
                          value: s,
                          child: Text(s.description),
                        ),
                      )
                      .toList(),
                  // Desabilita o dropdown se não houver estoque
                  onChanged: _temEstoqueSuficiente
                      ? (value) {
                          if (value != null) {
                            setState(() => _selectedStatus = value);
                          }
                        }
                      : null,
                ),
                const SizedBox(height: gaplg),
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
                _buildHistorySection(widget.ordem.historicoProducao),
              ],
            );
          },
        ),
      ),
      actions: [
        AppButton.text(
          label: 'Cancelar',
          onPressed: () => Navigator.of(context).pop(),
        ),
        // O botão de confirmar também precisa aguardar o Future
        FutureBuilder(
          future: _materiaisEstoqueFuture,
          builder: (context, snapshot) {
            final bool podeConfirmar =
                snapshot.connectionState == ConnectionState.done &&
                _temEstoqueSuficiente;

            return ValueListenableBuilder(
              valueListenable: _isPressed,
              builder: (context, pressed, _) => AppButton(
                isLoading: pressed,
                label: 'Confirmar',
                // Desabilita o botão se não puder confirmar
                onPressed: podeConfirmar ? _onPressedConfirmar : null,
              ),
            );
          },
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
