import 'package:go_router/go_router.dart';

class Router {
  // private:
  Router._();

  final _router = GoRouter(routes: []);

  // public:
  static final instance = Router._();

  GoRouter get router => _router;
}
