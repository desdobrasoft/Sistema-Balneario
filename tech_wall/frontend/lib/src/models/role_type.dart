enum RoleType {
  admin('Administração'),
  financeiro('Financeiro'),
  estoque('Estoque'),
  producao('Produção'),
  patio('Pátio'),
  entrega('Entrega');

  final String readable;

  const RoleType(this.readable);

  factory RoleType.fromString(String role) {
    return RoleType.values.firstWhere(
      (r) => r.name.toLowerCase() == role.toLowerCase(),
    );
  }
}
