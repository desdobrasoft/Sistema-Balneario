import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:multi_dropdown/multi_dropdown.dart';
import 'package:tech_wall/src/api/users/dto.dart';
import 'package:tech_wall/src/api/users/users.dart';
import 'package:tech_wall/src/components/app_button.dart';
import 'package:tech_wall/src/components/dialogs/interface.dart';
import 'package:tech_wall/src/constants/constants.dart' show gaplg;
import 'package:tech_wall/src/models/role_type.dart';
import 'package:tech_wall/src/utils/hint_style.dart';

class EditUser extends StatefulWidget implements DialogInterface {
  const EditUser({super.key, this.id, this.isOwner = false});

  final int? id;
  final bool isOwner;

  @override
  State<EditUser> createState() => _EditUserState();
}

class _EditUserState extends State<EditUser> {
  static const double _maxWidth = 500;

  late final bool _owner;

  final _formKey = GlobalKey<FormState>();
  final _isPressed = ValueNotifier(false);
  final _isPasswordVisible = ValueNotifier(false);
  final _isConfirmVisible = ValueNotifier(false);

  final _nameController = TextEditingController();
  final _userController = TextEditingController();
  final _emailController = TextEditingController();
  final _passController = TextEditingController();
  final _rolesController = MultiSelectController<RoleType>();

  @override
  void initState() {
    super.initState();
    _owner = widget.isOwner;
  }

  @override
  Widget build(BuildContext context) {
    final scheme = ColorScheme.of(context);

    return AlertDialog(
      scrollable: true,
      title: Text('Adicionar usuário'),
      content: ConstrainedBox(
        constraints: BoxConstraints(maxWidth: _maxWidth),
        child: SizedBox(
          width: double.maxFinite,
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              spacing: gaplg,
              children: [
                TextFormField(
                  autofocus: true,
                  controller: _nameController,
                  decoration: InputDecoration(
                    filled: true,
                    hintText: 'João da Silva',
                    hintStyle: hintStyle(context),
                    labelText: 'Nome completo',
                  ),
                  keyboardType: TextInputType.name,
                  maxLength: 255,
                  maxLengthEnforcement: MaxLengthEnforcement.enforced,
                  textInputAction: TextInputAction.next,
                ),
                TextFormField(
                  controller: _userController,
                  decoration: InputDecoration(
                    filled: true,
                    hintText: 'joao-da-silva',
                    hintStyle: hintStyle(context),
                    labelText: 'Usuário',
                  ),
                  keyboardType: TextInputType.name,
                  maxLength: 50,
                  maxLengthEnforcement: MaxLengthEnforcement.enforced,
                  textInputAction: TextInputAction.next,

                  errorBuilder: (context, errorText) => SizedBox(),
                ),
                TextFormField(
                  controller: _emailController,
                  decoration: InputDecoration(
                    filled: true,
                    hintText: 'joao.dasilva@email.com',
                    hintStyle: hintStyle(context),
                    labelText: 'Email',
                  ),
                  keyboardType: TextInputType.emailAddress,
                  maxLength: 100,
                  maxLengthEnforcement: MaxLengthEnforcement.enforced,
                  textInputAction: TextInputAction.next,
                ),
                ValueListenableBuilder(
                  valueListenable: _isPasswordVisible,
                  builder: (context, visible, _) {
                    return TextFormField(
                      controller: _passController,
                      decoration: InputDecoration(
                        filled: true,
                        hintText: '••••••',
                        hintStyle: hintStyle(context),
                        labelText: 'Senha',
                        suffixIcon: FocusScope(
                          canRequestFocus: false,
                          child: IconButton(
                            onPressed: () => _isPasswordVisible.value =
                                !_isPasswordVisible.value,
                            icon: Icon(
                              visible ? Icons.visibility_off : Icons.visibility,
                            ),
                          ),
                        ),
                      ),
                      keyboardType: TextInputType.visiblePassword,
                      obscureText: !visible,
                      textInputAction: TextInputAction.next,
                    );
                  },
                ),
                ValueListenableBuilder(
                  valueListenable: _isConfirmVisible,
                  builder: (context, visible, _) {
                    return TextFormField(
                      decoration: InputDecoration(
                        filled: true,
                        hintText: '••••••',
                        hintStyle: hintStyle(context),
                        labelText: 'Confirme sua senha',
                        suffixIcon: FocusScope(
                          canRequestFocus: false,
                          child: IconButton(
                            onPressed: () => _isConfirmVisible.value =
                                !_isConfirmVisible.value,
                            icon: Icon(
                              visible ? Icons.visibility_off : Icons.visibility,
                            ),
                          ),
                        ),
                      ),
                      keyboardType: TextInputType.visiblePassword,
                      obscureText: !visible,
                      textInputAction: TextInputAction.next,

                      onFieldSubmitted: (_) => _rolesController.openDropdown(),
                      validator: (value) {
                        if (_passController.text.isEmpty) return null;
                        if (value == null || value.isEmpty) {
                          return 'A senha é obrigatória';
                        }
                        if (value != _passController.text) {
                          return 'As senhas não são iguais';
                        }
                        return null;
                      },
                    );
                  },
                ),
                if (!_owner)
                  MultiDropdown(
                    controller: _rolesController,
                    searchEnabled: true,

                    chipDecoration: ChipDecoration(
                      backgroundColor: scheme.primaryContainer,
                      labelStyle: TextTheme.of(context).labelLarge,
                    ),
                    dropdownDecoration: DropdownDecoration(
                      backgroundColor: scheme.surfaceContainerHighest,
                    ),
                    dropdownItemDecoration: DropdownItemDecoration(
                      selectedBackgroundColor: scheme.primaryContainer,
                      selectedTextColor: scheme.onPrimaryContainer,
                      textColor: scheme.onSurface,
                    ),
                    fieldDecoration: FieldDecoration(
                      backgroundColor: scheme.surfaceContainerHighest,
                      border: UnderlineInputBorder(
                        borderSide: BorderSide(color: scheme.onSurfaceVariant),
                      ),
                      borderRadius: 0,
                      labelText: 'Funções',
                      hintText: RoleType.values.first.readable,
                      hintStyle: hintStyle(context),
                    ),

                    items: RoleType.values.map((role) {
                      return DropdownItem(label: role.readable, value: role);
                    }).toList(),
                  ),
              ],
            ),
          ),
        ),
      ),
      actions: [
        AppButton.text(label: 'Cancelar', onPressed: _onPressedCancelar),
        ValueListenableBuilder(
          valueListenable: _isPressed,
          builder: (context, pressed, _) {
            return AppButton(
              isLoading: pressed,
              label: 'Confirmar',
              onPressed: _onPressedConfirmar,
              loadingWidget: CircularProgressIndicator.adaptive(strokeWidth: 2),
            );
          },
        ),
      ],
    );
  }

  Future<void> _onPressedConfirmar() async {
    if (_formKey.currentState?.validate() != true) return;

    if (_isPressed.value) return;
    _isPressed.value = true;

    final bool success;

    if (_owner) {
      success = await UsersApi.editCurrent(
        UpdateUserDto(
          fullName: _nameController.text,
          username: _userController.text,
          email: _emailController.text,
          password: _passController.text,
        ),
      );
    } else {
      success = await UsersApi.editUser(
        id: widget.id ?? -1,
        dto: UpdateUserDto(
          fullName: _nameController.text,
          username: _userController.text,
          email: _emailController.text,
          password: _passController.text,
          roles: _rolesController.selectedItems
              .map((item) => item.value.name)
              .toList(),
        ),
      );
    }

    _isPressed.value = false;
    if (success && mounted) Navigator.of(context).pop(success);
  }

  Future<void> _onPressedCancelar() async {
    Navigator.of(context).pop();
  }
}
