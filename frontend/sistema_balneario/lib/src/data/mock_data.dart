import 'package:sistema_balneario/src/models/customer.dart';
import 'package:sistema_balneario/src/models/delivery_time_stats.dart';
import 'package:sistema_balneario/src/models/house_model.dart';
import 'package:sistema_balneario/src/models/model_material_item.dart';
import 'package:sistema_balneario/src/models/monthly_sales.dart';
import 'package:sistema_balneario/src/models/production_status_distribution.dart';

const customers = [
  CustomerModel(
    id: 'cust1',
    name: 'Alice Silva',
    email: 'alice@exemplo.com',
    phone: '(11) 98765-4321',
    address:
        'Rua da Fantasia, 123, Bairro dos Sonhos, Contolândia - SP, 01234-567',
    salesHistoryCount: 2,
  ),
  CustomerModel(
    id: 'cust2',
    name: 'Roberto Construtor',
    email: 'roberto@construtoraex.com',
    phone: '(21) 91234-5678',
    address: 'Avenida da Construção, 456, Centro, Cidadela - RJ, 12345-000',
    salesHistoryCount: 5,
  ),
  CustomerModel(
    id: 'cust3',
    name: 'Carlos Almeida Prado',
    email: 'carlos.prado@email.com',
    phone: '(31) 95678-1234',
    address: 'Travessa da Comédia, 789, Vila Alegre, Alegria - MG, 23456-789',
    salesHistoryCount: 1,
  ),
];

const deliveryTimeStats = [
  DeliveryTimeStats(count: 18, range: '10-12 dias'),
  DeliveryTimeStats(count: 22, range: '13-15 dias'),
  DeliveryTimeStats(count: 5, range: '>15 dias (Atraso Leve)'),
  DeliveryTimeStats(count: 2, range: 'Atrasadas (>5 dias)'),
];

const houseModels = [
  HouseModel(
    id: 'model44',
    name: 'CasaFácil Compacta 44m²',
    description:
        'Eficiência e praticidade em 44m². Ideal para quem busca um lar aconchegante e funcional, com 1 quarto, sala/cozinha integrada e banheiro. Kit completo.',
    materials: materialsModel44m,
    productionTime: standardProductionTime,
    imageUrl: 'https://placehold.co/600x400.png',
    price: 68000,
  ),
  HouseModel(
    id: 'model52',
    name: 'CasaFácil Conforto 52m²',
    description:
        'Conforto e bom aproveitamento de espaço em 52m². Com 2 quartos, sala de estar, cozinha e banheiro. Perfeita para pequenas famílias. Kit completo.',
    materials: materialsModel52m,
    productionTime: standardProductionTime,
    imageUrl: 'https://placehold.co/600x400.png',
    price: 82000,
  ),
  HouseModel(
    id: 'model56',
    name: 'CasaFácil Família 56m²',
    description:
        'Espaço e versatilidade em 56m². Oferece 2 quartos (sendo 1 suíte), sala ampla, cozinha, banheiro social e área de serviço. Ideal para quem precisa de mais espaço. Kit completo.',
    materials: materialsModel56m,
    productionTime: standardProductionTime,
    imageUrl: 'https://placehold.co/600x400.png',
    price: 95000,
  ),
];

const materialsModel44m = [
  ModelMaterialItem(id: 'concreto-radier-25mpa', quantity: 9),
  ModelMaterialItem(id: 'malha-aco-q61', quantity: 50),
  ModelMaterialItem(id: 'placa-est-120x240x10', quantity: 45),
  ModelMaterialItem(id: 'placa-std-100x240x10', quantity: 10),
  ModelMaterialItem(id: 'placa-ref-130x250x12', quantity: 5),
  ModelMaterialItem(id: 'placa-comp-090x240x10', quantity: 8),
  ModelMaterialItem(id: 'perfil-montante-90mm', quantity: 350),
  ModelMaterialItem(id: 'perfil-guia-90mm', quantity: 120),
  ModelMaterialItem(id: 'parafuso-autobrocante', quantity: 1.5),
  ModelMaterialItem(id: 'fita-junta', quantity: 2),
  ModelMaterialItem(id: 'massa-junta', quantity: 2),
  ModelMaterialItem(id: 'telha-fibrocimento', quantity: 20),
  ModelMaterialItem(id: 'kit-eletrico-basico', quantity: 1),
  ModelMaterialItem(id: 'kit-hidraulico-basico', quantity: 1),
  ModelMaterialItem(id: 'janela-aluminio-120x100', quantity: 2),
  ModelMaterialItem(id: 'janela-aluminio-060x060', quantity: 1),
  ModelMaterialItem(id: 'porta-externa-aco', quantity: 1),
  ModelMaterialItem(id: 'porta-interna-hdf', quantity: 2),
];

const materialsModel52m = [
  ModelMaterialItem(id: 'concreto-radier-25mpa', quantity: 11),
  ModelMaterialItem(id: 'malha-aco-q61', quantity: 60),
  ModelMaterialItem(id: 'placa-est-120x240x10', quantity: 50),
  ModelMaterialItem(id: 'placa-std-100x240x10', quantity: 12),
  ModelMaterialItem(id: 'placa-hidro-120x240x12', quantity: 6),
  ModelMaterialItem(id: 'placa-deco-120x240x8', quantity: 4),
  ModelMaterialItem(id: 'perfil-montante-90mm', quantity: 420),
  ModelMaterialItem(id: 'perfil-guia-90mm', quantity: 150),
  ModelMaterialItem(id: 'parafuso-autobrocante', quantity: 1.8),
  ModelMaterialItem(id: 'fita-junta', quantity: 2.4),
  ModelMaterialItem(id: 'massa-junta', quantity: 3),
  ModelMaterialItem(id: 'la-pet-isolamento', quantity: 55),
  ModelMaterialItem(id: 'telha-termoacustica-eps30', quantity: 60),
  ModelMaterialItem(id: 'kit-eletrico-basico', quantity: 1),
  ModelMaterialItem(id: 'kit-hidraulico-750l', quantity: 1),
  ModelMaterialItem(id: 'janela-aluminio-150x100', quantity: 2),
  ModelMaterialItem(id: 'janela-aluminio-100x100', quantity: 1),
  ModelMaterialItem(id: 'janela-aluminio-060x060', quantity: 1),
  ModelMaterialItem(id: 'porta-externa-aluminio', quantity: 1),
  ModelMaterialItem(id: 'porta-interna-hdf-080', quantity: 3),
];

const materialsModel56m = [
  ModelMaterialItem(id: 'concreto-radier-25mpa', quantity: 12),
  ModelMaterialItem(id: 'malha-aco-q75', quantity: 65),
  ModelMaterialItem(id: 'placa-alta-perf-120x240x12', quantity: 55),
  ModelMaterialItem(id: 'placa-superboard-120x240x10', quantity: 15),
  ModelMaterialItem(id: 'placa-slim-100x200x8', quantity: 10),
  ModelMaterialItem(id: 'placa-texturizada-120x240x10', quantity: 7),
  ModelMaterialItem(id: 'perfil-montante-100mm', quantity: 450),
  ModelMaterialItem(id: 'perfil-guia-100mm', quantity: 160),
  ModelMaterialItem(id: 'parafuso-autobrocante', quantity: 2),
  ModelMaterialItem(id: 'fita-junta', quantity: 2.6),
  ModelMaterialItem(id: 'massa-junta', quantity: 3),
  ModelMaterialItem(id: 'barreira-vapor', quantity: 60),
  ModelMaterialItem(id: 'telha-shingle-kit', quantity: 70),
  ModelMaterialItem(id: 'kit-eletrico-completo', quantity: 1),
  ModelMaterialItem(id: 'kit-hidraulico-1000l-pex', quantity: 1),
  ModelMaterialItem(id: 'janela-pvc-150x120', quantity: 2),
  ModelMaterialItem(id: 'janela-pvc-080x080', quantity: 1),
  ModelMaterialItem(id: 'janela-pvc-060x060', quantity: 1),
  ModelMaterialItem(id: 'porta-externa-pivotante', quantity: 1),
  ModelMaterialItem(id: 'porta-interna-laqueada', quantity: 3),
];

const monthlySales = [
  MonthlySales(month: 'Jan', sales: 120000),
  MonthlySales(month: 'Fev', sales: 180000),
  MonthlySales(month: 'Mar', sales: 150000),
  MonthlySales(month: 'Abr', sales: 210000),
  MonthlySales(month: 'Mai', sales: 160000),
  MonthlySales(month: 'Jun', sales: 250000),
];

const productionStatusDistribution = [
  ProductionStatusDistribution(count: 5, fill: '#e76e50', status: 'Agendados'),
  ProductionStatusDistribution(
    count: 12,
    fill: '#409d90',
    status: 'Em Progresso',
  ),
  ProductionStatusDistribution(
    count: 25,
    fill: '#274754',
    status: 'Concluídos',
  ),
  ProductionStatusDistribution(count: 2, fill: '#e8c468', status: 'Em Espera'),
];

const standardProductionTime = "10-15 dias úteis";
