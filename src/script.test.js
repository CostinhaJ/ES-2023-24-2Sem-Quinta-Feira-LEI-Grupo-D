
const { addWeeksToData, convertToDate, handleFileSelect, getWeekNumber, getSemesterWeekNumber,applyCustomFilters, setFilterMode } = require('./script');

jest.mock('papaparse', () => ({ parse: jest.fn() }));
const { parse } = require('papaparse');



describe('handleFileSelect', () => {
    test('deve chamar Papa.parse com os parâmetros corretos', () => {
      const file = new File(['conteúdo do arquivo'], 'arquivo.csv', { type: 'text/csv' });
      const event = { target: { files: [file] } };
  
      handleFileSelect(event);
  
      expect(parse).toHaveBeenCalledWith(file, {
        header: true,
        delimiter: ";",
        complete: expect.any(Function)
      });
    });
  });





describe('convertToDate', () => {
    test('deve retornar uma data correta para uma string de data válida', () => {
      const str = '01/12/2022';
      const result = convertToDate(str);
      expect(result).toEqual(new Date(2022, 11, 1));
    });
  
    test('deve retornar null para uma string de data inválida', () => {
      const str = '';
      const result = convertToDate(str);
      expect(result).toBeNull();
    });
  });
  


// describe('addWeeksToData', () => {
//   test('deve adicionar semanas do ano e do semestre corretamente', () => {
//     const data = [
//       { 'Data da aula': '01/01/2024' },
//       { 'Data da aula': '15/02/2024' },
//     ];

//     const result = addWeeksToData(data);

//     expect(result).toEqual([
//       { 'Data da aula': '01/01/2024', 'Semana do ano': 1, 'Semana do semestre': 'Fora do semestre' },
//       { 'Data da aula': '15/02/2024', 'Semana do ano': 7, 'Semana do semestre': 3 },
//     ]);
//   });
// });

describe('addWeeksToData', () => {
  test('deve adicionar semanas do ano e do semestre corretamente', () => {
    const data = [
      { 'Data da aula': '01/01/2024' },
      { 'Data da aula': '15/02/2024' },
    ];

    const result = addWeeksToData(data);

    expect(result).toEqual([
      { 'Data da aula': '01/01/2024', 'Semana do ano': 1, 'Semana do semestre': 'Fora do semestre' },
      { 'Data da aula': '15/02/2024', 'Semana do ano': 7, 'Semana do semestre': 3 },
    ]);
  });
  
  test('deve lidar com data inexistente corretamente', () => {
    const data = [{ 'Data da aula': '' }];
    const expected = [{
      'Data da aula': '',
    }];
    const result = addWeeksToData(data);
    expect(result).toEqual(expected);
  });

  test('deve lidar com data inválida corretamente', () => {
    const data = [{ 'Data da aula': '2024-03-35' }];
    const expected = [{
      'Data da aula': '2024-03-35',
    }];
    const result = addWeeksToData(data);
    expect(result).toEqual(expected);
  });
});



describe('getWeekNumber', () => {
    test('deve retornar o número da semana corretamente para uma data específica', () => {
      const date = new Date('2024-03-19');
      const result = getWeekNumber(date);
      expect(result).toBe(12);
    });
  });


describe('getSemesterWeekNumber', () => {
  test('deve retornar o número da semana do semestre corretamente para o primeiro semestre', () => {
    const result = getSemesterWeekNumber(10);
    expect(result).toBe(6);
  });

  test('deve retornar o número da semana do semestre corretamente para o segundo semestre', () => {
    const result = getSemesterWeekNumber(40);
    expect(result).toBe(6);
  });

  test('deve retornar "Fora do semestre" para semanas fora dos semestres', () => {
    const result = getSemesterWeekNumber(2);
    expect(result).toBe('Fora do semestre');
  });
});


describe('getSemesterWeekNumber', () => {
  test('Deve retornar o número da semana correta para o primeiro semestre', () => {
    expect(getSemesterWeekNumber(5)).toBe(1);
    expect(getSemesterWeekNumber(10)).toBe(6);
    expect(getSemesterWeekNumber(19)).toBe(15);
  });

  test('Deve retornar o número da semana correta para o segundo semestre', () => {
    expect(getSemesterWeekNumber(35)).toBe(1);
    expect(getSemesterWeekNumber(40)).toBe(6);
    expect(getSemesterWeekNumber(49)).toBe(15);
  });

  test('Deve retornar "Fora do semestre" para semanas fora dos semestres', () => {
    expect(getSemesterWeekNumber(4)).toBe('Fora do semestre');
    expect(getSemesterWeekNumber(20)).toBe('Fora do semestre');
    expect(getSemesterWeekNumber(34)).toBe('Fora do semestre');
    expect(getSemesterWeekNumber(50)).toBe('Fora do semestre');
  });
});




describe('setFilterMode', () => {
  let consoleLogSpy;

  beforeEach(() => {
      consoleLogSpy = jest.spyOn(console, 'log');
  });

  afterEach(() => {
      consoleLogSpy.mockRestore(); 
  });

  test('Deve definir o modo de filtro para "AND"', () => {
      setFilterMode('AND');
      expect(consoleLogSpy).toHaveBeenCalledWith('Modo de filtro alterado para:', 'AND'); 
  });

  test('Deve definir o modo de filtro para "OR"', () => {
      setFilterMode('OR');
      expect(consoleLogSpy).toHaveBeenCalledWith('Modo de filtro alterado para:', 'OR'); 
  });
});