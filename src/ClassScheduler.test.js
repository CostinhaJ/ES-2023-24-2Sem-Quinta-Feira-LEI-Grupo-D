import ClassScheduler from "./ClassScheduler";
import DateConverter from "./DateConverter";




describe('ClassScheduler', () => {
    describe('findSubstitutionSlots', () => {
        it('should return an alert if horario or salas are missing', () => {
            global.alert = jest.fn();  // Mock alert function
            const result = ClassScheduler.findSubstitutionSlots({}, null, null);
            expect(global.alert).toHaveBeenCalledWith('Por favor, carregue os ficheiros de horários e salas primeiro.');
            expect(result).toEqual([]);
        });

        it('should return the correct slots', () => {
            const filters = { DataIni: new Date('2024-05-14'), DataFim: new Date('2024-05-15') };
            const horario = [
                { 'Data da aula': '14/05/2024', 'Sala atribuída à aula': 'A101', 'Hora início da aula': '08:00', 'Hora fim da aula': '10:00' },
                { 'Data da aula': '14/05/2024', 'Sala atribuída à aula': 'B202', 'Hora início da aula': '11:00', 'Hora fim da aula': '13:00' },
                { 'Data da aula': '15/05/2024', 'Sala atribuída à aula': 'A101', 'Hora início da aula': '09:00', 'Hora fim da aula': '11:00' }
            ];
            const salas = [
                { 'Nome sala': 'A101' },
                { 'Nome sala': 'B202' }
            ];
            const expectedSlots = [
                { data: '2024-05-14', sala: 'A101', HoraIni: '10:00', HoraFim: '22:30' },
                { data: '2024-05-14', sala: 'B202', HoraIni: '08:00', HoraFim: '11:00' },
                { data: '2024-05-14', sala: 'B202', HoraIni: '13:00', HoraFim: '22:30' },
                { data: '2024-05-15', sala: 'A101', HoraIni: '11:00', HoraFim: '22:30' }
            ];
            
            jest.spyOn(ClassScheduler, 'findOpenSlots').mockReturnValue(expectedSlots);

            const result = ClassScheduler.findSubstitutionSlots(filters, horario, salas);
            expect(result).toEqual(expectedSlots);
        });
    });

    describe('findUCAllocationSlots', () => {
        it('should return an alert if horario or salas are missing', () => {
            global.alert = jest.fn();
            const result = ClassScheduler.findUCAllocationSlots({}, null, null);
            expect(global.alert).toHaveBeenCalledWith('Por favor, carregue os ficheiros de horários e salas primeiro.');
            expect(result).toEqual([]);
        });

        it('should allocate the correct number of classes', () => {
            const filters = { UCName: 'Test', NumberOfClasses: 2 };
            const horario = [
                { 'Data da aula': '14/05/2024', 'Sala atribuída à aula': 'A101', 'Hora início da aula': '08:00', 'Hora fim da aula': '10:00' },
                { 'Data da aula': '15/05/2024', 'Sala atribuída à aula': 'A101', 'Hora início da aula': '09:00', 'Hora fim da aula': '11:00' }
            ];
            const salas = [
                { 'Nome sala': 'A101' },
                { 'Nome sala': 'B202' }
            ];
            const slots = [
                { data: '2024-05-14', sala: 'A101', HoraIni: '10:00', HoraFim: '22:30' },
                { data: '2024-05-15', sala: 'A101', HoraIni: '11:00', HoraFim: '22:30' }
            ];

            jest.spyOn(ClassScheduler, 'findOpenSlots').mockReturnValue(slots);

            const result = ClassScheduler.findUCAllocationSlots(filters, horario, salas);
            expect(result).toEqual([
                { data: '2024-05-14', sala: 'A101', HoraIni: '10:00', HoraFim: '22:30', UC: 'Test', Turma: 'ME', Curso: 'ME' },
                { data: '2024-05-15', sala: 'A101', HoraIni: '11:00', HoraFim: '22:30', UC: 'Test', Turma: 'ME', Curso: 'ME' }
            ]);
        });
    });

    describe('findOpenSlots', () => {
        it('should return empty array if dates are not defined', () => {
            const result = ClassScheduler.findOpenSlots([], [], {});
            expect(result).toEqual([]);
        });

       
    });

    describe('listSalas', () => {
        it('should return the list of salas sorted', () => {
            const salas = [{ 'Nome sala': 'B102' }, { 'Nome sala': 'A101' }];
            const result = ClassScheduler.listSalas(salas);
            expect(result).toEqual(['A101', 'B102']);
        });
    });

  

    describe('findConflicts', () => {
        it('should find conflicting classes', () => {
            const data = [
                { 'Data da aula': '14/05/2024', 'Hora início da aula': '08:00', 'Hora fim da aula': '10:00' },
                { 'Data da aula': '14/05/2024', 'Hora início da aula': '09:00', 'Hora fim da aula': '11:00' }
            ];
            jest.spyOn(DateConverter, 'convertToDate').mockImplementation((date) => new Date(date.split('/').reverse().join('-')));

            const result = ClassScheduler.findConflicts(data);
            expect(result).toEqual([{ source: data[0], target: data[1] }]);
        });
    });

    describe('isConflicting', () => {
        it('should return true if classes are conflicting', () => {
            const aula1 = { 'Data da aula': '14/05/2024', 'Hora início da aula': '08:00', 'Hora fim da aula': '10:00' };
            const aula2 = { 'Data da aula': '14/05/2024', 'Hora início da aula': '09:00', 'Hora fim da aula': '11:00' };
            jest.spyOn(DateConverter, 'convertToDate').mockImplementation((date) => new Date(date.split('/').reverse().join('-')));

            const result = ClassScheduler.isConflicting(aula1, aula2);
            expect(result).toBe(true);
        });

        it('should return false if classes are not conflicting', () => {
            const aula1 = { 'Data da aula': '14/05/2024', 'Hora início da aula': '08:00', 'Hora fim da aula': '10:00' };
            const aula2 = { 'Data da aula': '15/05/2024', 'Hora início da aula': '09:00', 'Hora fim da aula': '11:00' };
            jest.spyOn(DateConverter, 'convertToDate').mockImplementation((date) => new Date(date.split('/').reverse().join('-')));

            const result = ClassScheduler.isConflicting(aula1, aula2);
            expect(result).toBe(false);
        });
    });




   
    

    describe('ClassScheduler - getDisponibilidadeSala', () => {
       
        test('should return available time slots for a given classroom schedule', () => {
            
            const horario = [
                { 'Sala atribuída à aula': 'A101', 'Hora início da aula': '08:00:00', 'Hora fim da aula': '10:00:00' },
                { 'Sala atribuída à aula': 'A101', 'Hora início da aula': '13:00:00', 'Hora fim da aula': '15:00:00' },
               
            ];
    
           
            const result = ClassScheduler.getDisponibilidadeSala(horario, 'A101');
    
            const expected = [
                { 'HoraIni': '10:00:00', 'HoraFim': '13:00:00' },
                { 'HoraIni': '15:00:00', 'HoraFim': '22:30:00' }
                
            ];
    
            
            expect(result).toEqual(expected);
        });
    
       
    });










});









