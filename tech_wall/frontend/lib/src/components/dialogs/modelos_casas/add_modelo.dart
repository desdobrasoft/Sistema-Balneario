import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:multi_dropdown/multi_dropdown.dart';
import 'package:tech_wall/src/api/materiais_estoque/materiais_estoque.dart';
import 'package:tech_wall/src/api/modelos_casas/dto.dart';
import 'package:tech_wall/src/api/modelos_casas/modelos_casas.dart';
import 'package:tech_wall/src/components/app_button.dart';
import 'package:tech_wall/src/components/dialogs/interface.dart';
import 'package:tech_wall/src/components/dialogs/utils/get_content_style.dart';
import 'package:tech_wall/src/constants/constants.dart' show gaplg, gapmd;
import 'package:tech_wall/src/models/material_estoque.dart';
import 'package:tech_wall/src/utils/formatador_moeda.dart';
import 'package:tech_wall/src/utils/hint_style.dart';

class AddModeloDialog extends StatefulWidget implements DialogInterface {
  const AddModeloDialog({super.key});

  @override
  State<AddModeloDialog> createState() => _AddModeloDialogState();
}

class _AddModeloDialogState extends State<AddModeloDialog> {
  static const _maxWidth = 500.0;
  static const _qtdeWidth = 100.0;

  final _formKey = GlobalKey<FormState>();
  final _formKeyQtde = GlobalKey<FormState>();
  final _isSubmitting = ValueNotifier(false);

  final _controllerNome = TextEditingController();
  final _controllerTempo = TextEditingController();
  final _controllerUrl = TextEditingController();
  final _controllerPreco = TextEditingController(text: '0,00');
  final _controllerDescricao = TextEditingController();
  final _controllerMateriais = MultiSelectController<MaterialEstoqueModel>();

  late ColorScheme _scheme;

  List<TextEditingController> _controllersMateriais = [];
  bool _isQuantidade = false;
  List<MaterialEstoqueModel>? _materiais;

  @override
  void initState() {
    super.initState();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      MateriaisEstoqueApi.listAll().then((materiais) {
        setState(() {
          _materiais = materiais;
        });
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    _scheme = ColorScheme.of(context);

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
              AppButton(
                label: 'Cancelar',
                onPressed: Navigator.of(context).pop,
              ),
            ],
          ),
        ),
      );
    }

    return AlertDialog(
      scrollable: true,
      title: Text('Adicionar'),
      content: SizedBox(
        width: _maxWidth,
        child: Form(
          key: _formKey,
          child: Builder(
            builder: (context) {
              if (_isQuantidade) {
                _controllersMateriais = _controllerMateriais.selectedItems
                    .map((material) => TextEditingController())
                    .toList();

                return Form(
                  key: _formKeyQtde,
                  child: ListenableBuilder(
                    listenable: _controllerMateriais,
                    builder: (context, _) {
                      final materiais = _controllerMateriais.selectedItems
                          .map((item) => item.value)
                          .toList();

                      return Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        spacing: gaplg,
                        children: List.generate(_controllersMateriais.length, (
                          i,
                        ) {
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

                                  validator: (value) {
                                    if (value?.isNotEmpty != true) {
                                      return 'Este campo não pode ficar vazio';
                                    }
                                    return null;
                                  },
                                ),
                              ),
                            ],
                          );
                        }),
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

                    validator: (value) {
                      if (value?.isNotEmpty != true) {
                        return 'Este campo não pode ficar vazio';
                      }
                      return null;
                    },
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
                    validator: (value) {
                      if (value?.isNotEmpty != true) {
                        return 'Este campo não pode ficar vazio';
                      }
                      return null;
                    },
                  ),
                  MultiDropdown(
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

                    items:
                        _materiais?.map((material) {
                          return DropdownItem(
                            label: material.item,
                            value: material,
                          );
                        }).toList() ??
                        List<DropdownItem<MaterialEstoqueModel>>.empty(
                          growable: false,
                        ),

                    validator: (value) {
                      if (value?.isNotEmpty != true) {
                        return 'Este campo não pode ficar vazio';
                      }
                      return null;
                    },
                  ),
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
        AppButton.text(
          onPressed: () {
            if (_isQuantidade) {
              setState(() {
                _isQuantidade = false;
              });
              return;
            }
            Navigator.of(context).pop();
          },

          child: Text(_isQuantidade ? 'Voltar' : 'Cancelar'),
        ),
        ValueListenableBuilder(
          valueListenable: _isSubmitting,
          builder: (context, submit, _) {
            return AppButton(
              iconPlacement: IconPlacement.right,
              isLoading: submit,

              onPressed: () async {
                if (_isQuantidade) {
                  await _submit();
                  return;
                }

                if (_formKey.currentState?.validate() == true) {
                  setState(() {
                    _isQuantidade = true;
                  });
                }
              },

              icon: Icon(Icons.check),
              child: Text(_isQuantidade ? 'Adicionar' : 'Próximo'),
            );
          },
        ),
      ],
    );
  }

  Future<void> _submit() async {
    if (_formKeyQtde.currentState?.validate() != true) return;

    if (_isSubmitting.value) return;
    _isSubmitting.value = true;

    await ModelosCasasApi.addModeloCasa(
      CreateModeloCasaDto(
        nome: _controllerNome.text,
        descricao: _controllerDescricao.text.isEmpty
            ? null
            : _controllerDescricao.text,
        tempoFabricacao: int.tryParse(_controllerTempo.text) ?? 0,
        urlImagem: _controllerUrl.text.isEmpty ? null : _controllerUrl.text,
        preco: double.tryParse(_controllerPreco.text.replaceAll(',', '.')) ?? 0,
        materiais: List.generate(_controllerMateriais.selectedItems.length, (
          i,
        ) {
          return MaterialRequeridoDto(
            materialId: _controllerMateriais.selectedItems[i].value.id,
            qtModelo: int.tryParse(_controllersMateriais[i].text) ?? 0,
          );
        }),
      ),
    );

    _isSubmitting.value = false;
    if (mounted) Navigator.of(context).pop();
  }
}
