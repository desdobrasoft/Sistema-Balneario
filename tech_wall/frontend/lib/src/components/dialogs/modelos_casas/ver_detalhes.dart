import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart' show NumberFormat;
import 'package:multi_dropdown/multi_dropdown.dart';
import 'package:tech_wall/src/api/materiais_estoque/materiais_estoque.dart';
import 'package:tech_wall/src/api/modelos_casas/dto.dart';
import 'package:tech_wall/src/api/modelos_casas/modelos_casas.dart';
import 'package:tech_wall/src/components/app_button.dart';
import 'package:tech_wall/src/components/dialogs/interface.dart';
import 'package:tech_wall/src/components/dialogs/utils/get_content_style.dart';
import 'package:tech_wall/src/constants/constants.dart' show gapmd, gaplg;
import 'package:tech_wall/src/models/material_estoque.dart';
import 'package:tech_wall/src/models/modelo_casa.dart';
import 'package:tech_wall/src/utils/formatador_moeda.dart';
import 'package:tech_wall/src/utils/get_localization.dart';
import 'package:tech_wall/src/utils/hint_style.dart';

class VerDetalhesDialog extends StatefulWidget implements DialogInterface {
  const VerDetalhesDialog({super.key, required this.modelo});

  final ModeloCasaModel modelo;

  @override
  State<VerDetalhesDialog> createState() => _VerDetalhesDialogState();
}

class _VerDetalhesDialogState extends State<VerDetalhesDialog> {
  static const _maxWidth = 500.0;
  static const _qtdeWidth = 100.0;

  late final ModeloCasaModel _modelo;

  final _isSubmitting = ValueNotifier(false);

  final _controllerNome = TextEditingController();
  final _controllerTempo = TextEditingController();
  final _controllerUrl = TextEditingController();
  final _controllerPreco = TextEditingController(text: '0,00');
  final _controllerDescricao = TextEditingController();
  final _controllerMateriais = MultiSelectController<MaterialEstoqueModel>();

  late ColorScheme _scheme;

  List<TextEditingController> _controllersMateriais = [];
  bool _edit = false;
  bool _isQuantidade = false;
  List<MaterialEstoqueModel>? _materiais;
  List<DropdownItem<MaterialEstoqueModel>> _items = [];

  @override
  void initState() {
    super.initState();
    _modelo = widget.modelo;
    _controllerNome.text = _modelo.nome;
    _controllerTempo.text = _modelo.tempoFabricacao.toString();
    _controllerUrl.text = _modelo.urlImagem ?? '';
    _controllerPreco.text = _modelo.preco
        .toStringAsFixed(2)
        .replaceAll('.', ',');
    _controllerDescricao.text = _modelo.descricao ?? '';
    _controllerMateriais.addListener(_listener);

    WidgetsBinding.instance.addPostFrameCallback((_) {
      MateriaisEstoqueApi.listAll().then((materiais) {
        setState(() {
          _materiais = materiais;
          _items =
              _materiais?.map((material) {
                return DropdownItem(label: material.item, value: material);
              }).toList() ??
              List<DropdownItem<MaterialEstoqueModel>>.empty(growable: false);
        });
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_materiais == null) {
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
                    'Carregando lista de materiais, por favor aguarde...',
                    style: contentStyle(context),
                  ),
                ),
                CircularProgressIndicator(),
              ],
            ),
            actions: [
              TextButton(
                onPressed: Navigator.of(context).pop,
                child: Text('Cancelar'),
              ),
            ],
          ),
        ),
      );
    }

    _scheme = ColorScheme.of(context);

    if (_edit) {
      return AlertDialog(
        scrollable: true,
        title: Text('Editar'),
        content: SizedBox(
          width: _maxWidth,
          child: Form(
            child: Builder(
              builder: (context) {
                if (_isQuantidade) {
                  _controllersMateriais = _controllerMateriais.selectedItems
                      .map(
                        (material) => TextEditingController(
                          text: _modelo.materiais
                              .firstWhere(
                                (modMat) =>
                                    modMat.material.id == material.value.id,
                              )
                              .qtModelo
                              .toString(),
                        ),
                      )
                      .toList();

                  return Form(
                    child: ListenableBuilder(
                      listenable: _controllerMateriais,
                      builder: (context, _) {
                        final materiais = _controllerMateriais.selectedItems
                            .map((item) => item.value)
                            .toList();

                        return Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          spacing: gaplg,
                          children: List.generate(
                            _controllersMateriais.length,
                            (i) {
                              final controller = _controllersMateriais[i];

                              return Row(
                                children: [
                                  Expanded(child: Text(materiais[i].item)),
                                  SizedBox(
                                    width: _qtdeWidth,
                                    child: TextFormField(
                                      controller: controller,
                                      decoration: InputDecoration(
                                        filled: true,
                                        labelText: 'Qtde.',
                                      ),
                                      inputFormatters: [
                                        FilteringTextInputFormatter.digitsOnly,
                                      ],
                                      textAlign: TextAlign.end,
                                      keyboardType: TextInputType.number,
                                      textInputAction: TextInputAction.next,
                                    ),
                                  ),
                                ],
                              );
                            },
                          ),
                        );
                      },
                    ),
                  );
                }

                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  spacing: gaplg,
                  children: [
                    TextFormField(
                      autofocus: true,
                      controller: _controllerNome,
                      decoration: InputDecoration(
                        filled: true,
                        hintText: 'Casa 50m²',
                        hintStyle: hintStyle(context),
                        labelText: 'Nome do modelo',
                      ),
                      keyboardType: TextInputType.name,
                      maxLength: 255,
                      maxLengthEnforcement: MaxLengthEnforcement.enforced,
                      textInputAction: TextInputAction.next,
                    ),
                    TextFormField(
                      controller: _controllerTempo,
                      decoration: InputDecoration(
                        filled: true,
                        labelText: 'Tempo de fabricação',
                        suffixText: ' dias',
                      ),
                      inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                      textAlign: TextAlign.end,
                      keyboardType: TextInputType.number,
                      textInputAction: TextInputAction.next,
                    ),
                    TextFormField(
                      controller: _controllerUrl,
                      decoration: InputDecoration(
                        filled: true,
                        hintText: 'http://localhost:8080/imagens/imagem.png',
                        hintStyle: hintStyle(context),
                        labelText: 'URL da imagem',
                      ),
                      keyboardType: TextInputType.url,
                      textInputAction: TextInputAction.next,
                    ),
                    TextFormField(
                      controller: _controllerPreco,
                      decoration: InputDecoration(
                        filled: true,
                        labelText: 'Preço',
                        prefixText: 'R\$ ',
                      ),
                      inputFormatters: [CurrencyInputFormatter()],
                      keyboardType: TextInputType.number,
                      textInputAction: TextInputAction.next,

                      onFieldSubmitted: (_) =>
                          _controllerMateriais.openDropdown(),
                    ),
                    _buildSelect(),
                    TextFormField(
                      controller: _controllerDescricao,
                      decoration: InputDecoration(
                        filled: true,
                        hintText:
                            'Casa com 50 metros quadrados de área, 2 quartos, 1 banheiro, sala e cozinha.',
                        hintStyle: hintStyle(context),
                        labelText: 'Descrição',
                      ),
                      keyboardType: TextInputType.multiline,
                      maxLines: null,
                    ),
                  ],
                );
              },
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () {
              if (_isQuantidade) {
                setState(() {
                  _isQuantidade = false;
                });
                return;
              }
              setState(() {
                _edit = false;
              });
            },

            child: Text(_isQuantidade ? 'Voltar' : 'Cancelar'),
          ),
          ValueListenableBuilder(
            valueListenable: _isSubmitting,
            builder: (context, submit, _) {
              if (_isQuantidade) {
                return AppButton(
                  iconPlacement: IconPlacement.right,
                  isLoading: submit,

                  onPressed: _submit,

                  icon: Icon(Icons.check),
                  child: Text('Confirmar'),
                );
              }

              return FilledButton(
                onPressed: () async {
                  setState(() {
                    _isQuantidade = true;
                  });
                },

                child: Text('Próximo'),
              );
            },
          ),
        ],
      );
    }

    final currencyFormatter = NumberFormat.currency(
      locale: localization(context).localeName,
      symbol: 'R\$',
    );

    return AlertDialog(
      scrollable: true,
      title: Row(
        mainAxisSize: MainAxisSize.max,
        children: [
          Expanded(child: Text(_modelo.nome)),
          IconButton(
            onPressed: () => setState(() => _edit = true),
            icon: Icon(Icons.edit),
          ),
        ],
      ),
      content: SizedBox(
        width: _maxWidth,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. Exibição da Imagem (se existir)
            if (_modelo.urlImagem != null && _modelo.urlImagem!.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(bottom: gaplg),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(12.0),
                  child: Image.network(
                    _modelo.urlImagem!,
                    height: 180,
                    width: double.infinity,
                    fit: BoxFit.cover,
                    // Placeholder em caso de erro ao carregar a imagem
                    errorBuilder: (context, error, stackTrace) {
                      return const Center(
                        child: Icon(Icons.error_outline, size: 48),
                      );
                    },
                  ),
                ),
              ),

            // 2. Detalhes Principais (Preço e Tempo de Fabricação)
            _buildDetailRow(
              icon: Icons.attach_money,
              label: 'Preço de Venda:',
              // Formatação simples para o padrão brasileiro
              value: currencyFormatter.format(_modelo.preco),
            ),
            const SizedBox(height: gapmd),
            _buildDetailRow(
              icon: Icons.timer_outlined,
              label: 'Tempo de Fabricação:',
              value: '${_modelo.tempoFabricacao} dias',
            ),
            const Divider(height: gaplg * 2),

            // 3. Descrição
            if (_modelo.descricao != null && _modelo.descricao!.isNotEmpty) ...[
              Text('Descrição', style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: gapmd),
              Text(
                _modelo.descricao!,
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const Divider(height: gaplg * 2),
            ],

            // 4. Lista de Materiais
            Text(
              'Materiais Necessários',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: gapmd),
            if (_modelo.materiais.isEmpty)
              const Text('Nenhum material cadastrado para este modelo.')
            else
              Column(
                children: _modelo.materiais.map((materialRequerido) {
                  return ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: Icon(
                      Icons.build_circle_outlined,
                      color: _scheme.secondary,
                    ),
                    title: Text(materialRequerido.material.item),
                    trailing: Text(
                      '${materialRequerido.qtModelo} un.',
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                  );
                }).toList(),
              ),
          ],
        ),
      ),
      actions: [
        AppButton(label: 'Fechar', onPressed: Navigator.of(context).pop),
      ],
    );
  }

  Widget _buildSelect() {
    return MultiDropdown(
      controller: _controllerMateriais,
      searchEnabled: true,

      chipDecoration: ChipDecoration(
        backgroundColor: _scheme.primaryContainer,
        labelStyle: TextTheme.of(context).labelLarge,
      ),
      dropdownDecoration: DropdownDecoration(
        backgroundColor: _scheme.surfaceContainerHighest,
        maxHeight: MediaQuery.of(context).size.height * 0.4,
      ),
      dropdownItemDecoration: DropdownItemDecoration(
        selectedBackgroundColor: _scheme.primaryContainer,
        selectedTextColor: _scheme.onPrimaryContainer,
        textColor: _scheme.onSurface,
      ),
      fieldDecoration: FieldDecoration(
        backgroundColor: _scheme.surfaceContainerHighest,
        border: UnderlineInputBorder(
          borderSide: BorderSide(color: _scheme.onSurfaceVariant),
        ),
        borderRadius: 0,
        labelText: 'Materiais',
        hintText: _materiais?.firstOrNull?.item,
        hintStyle: hintStyle(context),
      ),

      items: _items,
    );
  }

  Widget _buildDetailRow({
    required IconData icon,
    required String label,
    required String value,
  }) {
    final textTheme = Theme.of(context).textTheme;
    return Row(
      children: [
        Icon(icon, size: 20, color: _scheme.onSurfaceVariant),
        const SizedBox(width: gapmd),
        Text(label, style: textTheme.labelLarge),
        const Spacer(),
        Text(
          value,
          style: textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.bold),
        ),
      ],
    );
  }

  void _listener() {
    if (_controllerMateriais.items.isNotEmpty) {
      _controllerMateriais.removeListener(_listener);

      _controllerMateriais.selectWhere(
        (item) =>
            _modelo.materiais.indexWhere(
              (material) => material.material.id == item.value.id,
            ) !=
            -1,
      );
    }
  }

  Future<void> _submit() async {
    if (_isSubmitting.value) return;
    _isSubmitting.value = true;

    await ModelosCasasApi.editModeloCasa(
      id: _modelo.id,
      dto: UpdateModeloCasaDto(
        nome: _controllerNome.text,
        descricao: _controllerDescricao.text.isEmpty
            ? null
            : _controllerDescricao.text,
        tempoFabricacao: int.tryParse(_controllerTempo.text) ?? 0,
        urlImagem: _controllerUrl.text.isEmpty ? null : _controllerUrl.text,
        preco: double.tryParse(_controllerPreco.text.replaceAll(',', '.')) ?? 0,
        materiais: List.generate(
          _controllerMateriais.selectedItems.length,
          (i) => MaterialRequeridoDto(
            materialId: _controllerMateriais.selectedItems[i].value.id,
            qtModelo: int.tryParse(_controllersMateriais[i].text) ?? 0,
          ),
        ),
      ),
    );

    _isSubmitting.value = false;
    if (mounted) Navigator.of(context).pop();
  }
}
