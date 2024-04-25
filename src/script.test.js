
const {handleFileSelect , setFilterMode, handleClassroomFile} = require('./script');


jest.mock('papaparse', () => ({ parse: jest.fn() }));
const { parse } = require('papaparse');

describe('handleClassroomFile', () => {
    test('deve chamar Papa.parse com os parâmetros corretos', () => {
        const file = new File(['conteúdo do arquivo'], 'arquivo.csv', { type: 'text/csv' });
        const event = { target: { files: [file] } };

        handleClassroomFile(event);

        expect(parse).toHaveBeenCalledWith(file, {
            header: true,
            delimiter: ";",
            complete: expect.any(Function)
        });
    });
});



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

    test('deve fazer o parsing do CSV a partir de um URL', () => {
        const url = 'https://example.com/data.csv';
        handleFileSelect(url);
        expect(parse).toHaveBeenCalledWith(url, {
            download: true,
            header: true,
            complete: expect.any(Function),
            error: expect.any(Function)
        });
    });

    test('deve fazer o parsing do CSV a partir de um arquivo de input', () => {
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




