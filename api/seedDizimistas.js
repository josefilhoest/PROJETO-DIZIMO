import sequelize from "./database/database.js";
import Dizimista from "./models/Dizimista.js";

const pessoas = [
  [1, "Elenita Sabino Ribeiro"],
  [2, "Aliana Oliveira dos Santos"],
  [3, "Ana Karla Rebouças da Rocha"],
  [4, "Antônio Aires do Nascimento"],
  [5, "Marlene Oliveira"],
  [6, "Áurea Oliveira dos Santos"],
  [7, "Maria Cleide Bernardino"],
  [8, "Clotildes Antunes Lino"],
  [9, "Luiz Lopes Miranda"],
  [10, "Estelvina Miranda de Oliveira"],
  [11, "Euseni Ribeiro da Silva Lima"],
  [12, "Francisca Eucilene Lima Araújo"],
  [13, "Carlos José pereira das Chagas"],
  [14, "Francisco Flávio da Silva"],
  [15, "Luiz Gomes da Silva"],
  [16, "José Aires do Nascimento"],
  [17, "Giseuda Sousa da Silva"],
  [18, "Maria Liduina Pereira de Almeida"],
  [19, "Osana Ribeiro da Silva"],
  [20, "Maria José Holanda"],
  [21, "Lúcia Ribeiro"],
  [22, "Euzeir Ribeiro da Silva"],
  [23, "Luciano Fagundes"],
  [24, "Raimunda Luiz de Freitas"],
  [25, "José Augusto Rodrigues"],
  [26, "Josélia Barros Santos"],
  [27, "Marcia Lino de Anastácio da Silva"],
  [28, "José Costa de Barros"],
  [29, "Sandro pereira Maranhão"],
  [30, "Francisca oliveira de Freitas"],
  [31, "José Ribeiro Filho"],
  [32, "José Ricardino Filho"],
  [33, "Raimunda Barros da Silva"],
  [34, "José Rodrigues dos Santos"],
  [35, "Francisco de Assis da Silva Casciano"],
  [36, "Juscelino Fernandes da Silva"],
  [37, "Leonides Lopes dos Santos"],
  [38, "Leonildes Alexandre Oliveira"],
  [39, "Leontina Lopes Rodrigues"],
  [40, "Luiz Alexandre Sousa"],

  [41, "Luciene Pereira Maranhão"],
  [42, "Manoel Beserra da Silva"],
  [43, "Maria Auxiliadora de Sousa Rebouças"],
  [44, "Maria Bernardino dos Santos"],
  [45, "Maria Clemilda Lopes Rodrigues"],
  [46, "Daniele Rufino da Silva"],
  [47, "Maria de Fátima dos Santos Silva"],
  [48, "Maria de Oliveira Silva"],
  [49, "Maria de Socorro de Oliveira Rebouças"],
  [50, "Carolina Cassiano de Souza"],
  [51, "Maria do Carmo Holanda da Silva"],
  [52, "Maria Elizabete Nascimento dos Santos"],
  [53, "Maria Gomes Nascimento"],
  [54, "Maria Helena Holanda da Silva"],
  [55, "Maria Irene Rufino de Sena"],
  [56, "Maria Irenilda Severino dos Santos"],
  [57, "Maria Janaina Firmino Ribeiro"],
  [58, "Lucielma de Lima Silva"],
  [59, "Antônio Pereira Maranhão"],
  [60, "FCª Florêncio da Silva"],
  [61, "Maria Lourdes da Silva"],
  [62, "Maria Firmino Ribeiro"],
  [63, "Maria Marques da Silva"],
  [64, "Maria Moreira de Sousa"],
  [65, "Maria Nenzinha barros de lima"],
  [66, "Maria do Socorro Ferreira da Silva"],
  [67, "Maria Ribeiro do Nascimento"],
  [68, "Maria Leonor Ribeiro"],
  [69, "Maria Rodrigues da Silva"],
  [70, "Maria Stela Pinto Monteiro"],
  [71, "Liduina Pereira"],
  [72, "Marisa Antunes do Nascimento"],
  [73, "Marizete Ribeiro dos Santos"],
  [74, "Mércia Caride Belarmino Pereira"],
  [75, "Robério Anástacio Dias"],
  [76, "Nerli Rodrigues dos Santos"],
  [77, "Paulo Marques da Silva"],
  [78, "Paulo Sergio Ribeiro"],
  [79, "Francisca Liduina da Costa Ribeiro"],
  [80, "Lucielva de Lima Silva"],

  [81, "Maria Deusa Paixao"],
  [82, "Maria Ribeiro Freitas"],
  [83, "Raul Felipe Rocha dos Santos"],
  [84, "Vitória Oliveira"],
  [85, "Raimunda Sousa da Silva"],
  [86, "Raimundo Fernandes Pereira"],
  [87, "Robério Ribeiro Freitas"],
  [88, "Rosa dos Santos Rodrigues"],
  [89, "Rosa Paixão Ribeiro"],
  [90, "Rosa Ribeiro dos Anjos"],
  [91, "Sandra Maria Pinto Monteiro e Silva"],
  [92, "Sebastião Messias Rodrigues"],
  [93, "Valdelice de Oliveira Pereira"],
  [94, "Silvia Helena Pinto Monteiro"],
  [95, "Solange dos Santos Monteiro"],
  [96, "Solonildo Oliveira dos Santos"],
  [97, "Maria Augusta de Barros"],
  [98, "Edna Batista Rodrigues"],
  [99, "Sergiane da Silva Azevedo"],
  [100, "Verônica Cassiano de Souza"],
  [101, "Wilson Batista de Almeida"],
  [102, "Luiz Lourenço das Chagas"],
  [103, "Francisco Onório dos Santos"],
  [104, "Lucimar Nunes da Silva"],
  [105, "Noélia Ribeiro da Rocha"],
  [106, "Francisca dos Santos Barros"],
  [107, "Leda Maria do nascimento Alves"],
  [108, "Edna da Silva Casciano"],
  [109, "Nair Fernandes dos Santos"],
  [110, "Raimunda Ribeiro da Silva"],
  [111, "Guiomar Itelvina de Oliveira"],
  [112, "Elineide Fernandes dos Santos"],
  [113, "Maria de Lurdes Lino Ribeiro"],
  [114, "Edivando Gomes"],
  [115, "Rosenir Ribeiro Lucas"],
  [116, "Maria de Fátima Cassiano Rocha"],
  [117, "Raimunda Barros da Silva"],
  [118, "Maria Ferreira Franco"],
  [119, "Maria Lúcia de Souza Sena"],
  [120, "Maria Aldeniza da Silva"],

  [121, "Maria Torres Rodrigues Cardoso"],
  [122, "Maria do Socorro da Silva"],
  [123, "José da Silva Casciano"],
  [124, "Raimunda Martins da Cruz"],
  [125, "Francisca Ribeiro dos Santos"],
  [126, "Francisco Cleilson Lopes Rodrigues"],
  [127, "Francisco Cleiton Lopes Rodrigues"],
  [128, "Maria Lino de Anastácio"],
  [129, "Daniel Rufino de Sena"],
  [130, "Francisca Sonayra Pinto Monteiro"],
  [131, "Socorro Barros Pereira"],
  [132, "Maria Ednilza Silvério de Almeida"],
  [133, "Madalena Ribeiro dos Santos"],
  [134, "Luzirene Cassiano Ribeiro"],
  [135, "Rosineide Rufino de Sena"],
  [136, "Maria Leoneide de Souza Rebouças"],
  [137, "Maria Elenir Gomes"],
];

const calcularFolha = (numero) => {
  if (numero >= 1 && numero <= 40) {
    return 1;
  }

  if (numero >= 41 && numero <= 80) {
    return 2;
  }

  if (numero >= 81 && numero <= 120) {
    return 3;
  }

  return 4;
};

async function executarSeed() {
  console.log("Conectando ao banco de dados...");

  await sequelize.authenticate();

  console.log("Banco conectado.");

  let cadastrados = 0;
  let atualizados = 0;

  for (const [numero, nome] of pessoas) {
    const folha = calcularFolha(numero);

    const existente = await Dizimista.findOne({
      where: {
        numero: numero,
      },
    });

    if (existente) {
      await existente.update({
        nome: nome,
        folha: folha,
      });

      atualizados++;
    } else {
      await Dizimista.create({
        numero: numero,
        folha: folha,
        nome: nome,
        valor: 0,
      });

      cadastrados++;
    }
  }

  console.log("Seed concluído com sucesso.");

  return {
    total: pessoas.length,
    cadastrados,
    atualizados,
  };
}

export default executarSeed;