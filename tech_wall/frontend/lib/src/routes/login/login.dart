import 'package:flutter/material.dart';
import 'package:flutter/services.dart' show FilteringTextInputFormatter;
import 'package:go_router/go_router.dart';
import 'package:tech_wall/src/api/auth.dart';
import 'package:tech_wall/src/components/app_button.dart';
import 'package:tech_wall/src/constants/constants.dart' show gapxl, gapxs;
import 'package:tech_wall/src/routes/login/logo.dart';
import 'package:tech_wall/src/routes/routes.dart';
import 'package:tech_wall/src/utils/get_localization.dart';
import 'package:tech_wall/src/utils/hint_style.dart';

class Login extends StatefulWidget {
  const Login({super.key});

  @override
  State<Login> createState() => _LoginState();
}

class _LoginState extends State<Login> {
  static const double _submitLabelFontSize = 28;
  static const double _maxWidth = 400;

  final _controllerUsr = TextEditingController();
  final _controllerPwd = TextEditingController();

  final _focusNodeUsr = FocusNode();
  final _focusNodePwd = FocusNode();

  final _formKey = GlobalKey<FormState>();
  final _isSubmitting = ValueNotifier(false);
  final _isObscured = ValueNotifier(true);

  late TextTheme _styles;

  @override
  Widget build(BuildContext context) {
    _styles = TextTheme.of(context);

    return Scaffold(
      body: Center(
        child: SingleChildScrollView(
          child: Card(
            margin: EdgeInsets.all(gapxl),
            child: Container(
              padding: EdgeInsets.all(gapxl),
              width: _maxWidth,
              child: Form(
                autovalidateMode: AutovalidateMode.onUnfocus,
                key: _formKey,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  spacing: gapxl,
                  children: [
                    SizedBox(height: 120, child: Logo()),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      spacing: gapxs,
                      children: [
                        Text(
                          localization(context).loginUsernameLabel,
                          style: _styles.labelLarge,
                        ),
                        TextFormField(
                          controller: _controllerUsr,
                          focusNode: _focusNodeUsr,
                          inputFormatters: [
                            FilteringTextInputFormatter.deny(RegExp(r'\s+')),
                          ],
                          keyboardType: TextInputType.emailAddress,

                          onFieldSubmitted: (_) {
                            _focusNodePwd.requestFocus();
                          },
                          onTapOutside: (_) => _focusNodeUsr.unfocus(),
                          validator: (usr) {
                            if (usr?.isNotEmpty != true) {
                              return localization(context).loginUsernameError;
                            }
                            return null;
                          },

                          decoration: InputDecoration(
                            border: OutlineInputBorder(),
                            filled: true,
                            hintText: localization(context).loginUsernameHint,
                            hintStyle: hintStyle(context),
                            isDense: true,
                            prefixIcon: Icon(Icons.person),
                          ),
                        ),
                      ],
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      spacing: gapxs,
                      children: [
                        Text(
                          localization(context).loginPasswordLabel,
                          style: _styles.labelLarge,
                        ),
                        ValueListenableBuilder(
                          valueListenable: _isObscured,
                          builder: (context, obscure, _) {
                            return TextFormField(
                              controller: _controllerPwd,
                              focusNode: _focusNodePwd,
                              inputFormatters: [
                                FilteringTextInputFormatter.deny(
                                  RegExp(r'\s+'),
                                ),
                              ],
                              keyboardType: TextInputType.visiblePassword,
                              obscureText: obscure,

                              onFieldSubmitted: (_) => _submit(),
                              onTapOutside: (_) => _focusNodePwd.unfocus(),
                              validator: (usr) {
                                if (usr?.isNotEmpty != true) {
                                  return localization(
                                    context,
                                  ).loginPasswordError;
                                }
                                return null;
                              },

                              decoration: InputDecoration(
                                border: OutlineInputBorder(),
                                filled: true,
                                hintText: localization(
                                  context,
                                ).loginPasswordHint,
                                hintStyle: hintStyle(context),
                                isDense: true,
                                prefixIcon: Icon(Icons.password),
                                suffixIcon: FocusScope(
                                  canRequestFocus: false,
                                  child: IconButton(
                                    onPressed: () =>
                                        _isObscured.value = !_isObscured.value,
                                    icon: Icon(
                                      obscure
                                          ? Icons.visibility
                                          : Icons.visibility_off,
                                    ),
                                  ),
                                ),
                              ),
                            );
                          },
                        ),
                      ],
                    ),
                    ValueListenableBuilder(
                      valueListenable: _isSubmitting,
                      builder: (context, loading, _) {
                        return AppButton.tonal(
                          expand: true,
                          fontSize: _submitLabelFontSize,
                          iconPlacement: IconPlacement.right,
                          isLoading: loading,

                          onPressed: _submit,

                          icon: Icon(Icons.login, size: _submitLabelFontSize),
                          child: Padding(
                            padding: EdgeInsets.symmetric(vertical: gapxs),
                            child: Text(
                              localization(context).loginSubmitButtonLabel,
                              style: TextStyle(fontSize: _submitLabelFontSize),
                              textAlign: TextAlign.center,
                            ),
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _submit() async {
    if (_isSubmitting.value || _formKey.currentState?.validate() != true) {
      return;
    }

    _isSubmitting.value = true;

    await AuthApi.api.login(
      user: _controllerUsr.text,
      password: _controllerPwd.text,
    );

    if (AuthApi.api.isAuthenticated && mounted) {
      context.goNamed(Routes.home.name);
    }

    _isSubmitting.value = false;
  }
}
