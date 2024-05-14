import DateConverter from "./DateConverter";

export default class ClassScheduler {
    static findSubstitutionSlots(filters, horario, salas) {
        if (!horario || !salas) {
            alert("Por favor, carregue os ficheiros de horários e salas primeiro.");
            return [];
        }

        return this.findOpenSlots(salas, horario, filters);
    }

    static findUCAllocationSlots(filters, horario, salas) {
        if (!horario || !salas) {
            alert("Por favor, carregue os ficheiros de horários e salas primeiro.");
            return [];
        }

        const slots = this.findOpenSlots(salas, horario, filters);
        const allocatedSlots = [];

        for (let i = 0; i < filters.NumberOfClasses; i++) {
            if (slots.length > 0) {
                const slot = slots.shift();
                allocatedSlots.push({
                    ...slot,
                    UC: filters.UCName,
                    Turma: "ME",
                    Curso: "ME",
                });
            } else {
                break;
            }
        }

        return allocatedSlots;
    }

    static findOpenSlots(classroom, horario, filters) {
        if (filters.DataIni != undefined && filters.DataFim != undefined) {
            var days = [];
            for (let date = new Date(filters.DataIni.getTime()); date <= filters.DataFim; date.setDate(date.getDate() + 1)) {
                days.push(new Date(date.getTime()));
            }

            var fHorario = horario.filter(aula => {
                if (aula['Data da aula'] != undefined) {
                    const d = aula['Data da aula'].split("/");
                    const date = new Date(d[2], parseInt(d[1]) - 1, d[0]);
                    return date.getTime() >= filters.DataIni.getTime() && date.getTime() <= filters.DataFim.getTime();
                }
                return false;
            });

            var salas = this.listSalas(classroom);
            var slots = [];

            days.forEach(data => {
                var dHorario = fHorario.filter(a => {
                    const d = a['Data da aula'].split("/");
                    const date = new Date(d[2], parseInt(d[1]) - 1, d[0]);
                    return data.getTime() === date.getTime();
                });

                salas.forEach(sala => {
                    let daySala = this.getDisponibilidadeSala(dHorario, sala, data);
                    daySala.forEach(time => {
                        slots.push({ data: data.toISOString().split('T')[0], sala: sala, HoraIni: time.HoraIni, HoraFim: time.HoraFim });
                    });
                });
            });

            return slots;
        } else {
            return [];
        }
    }

    static listSalas(classroom) {
        let res = [];
        classroom.forEach(sala => {
            res.push(sala['Nome sala']);
        });
        res.sort((a, b) => a.localeCompare(b));
        return res;
    }

    static getDisponibilidadeSala(horario, nome) {
        let daysOcupados = horario.filter((aula => {
            return aula['Sala atribuída à aula'].trim() === nome.trim();
        })).sort((a, b) => {
            if (a['Hora início da aula'] != undefined && b['Hora início da aula'] != undefined) {
                const t1 = a['Hora início da aula'].split(":");
                const t2 = b['Hora início da aula'].split(":");
                if (t1[0] != t2[0]) {
                    return parseInt(t1[0]) - parseInt(t2[0]);
                } else {
                    return parseInt(t1[1]) - parseInt(t2[1]);
                }
            }
            return 0;
        });

        let timedays = [];
        let time = "08:00:00";

        daysOcupados.forEach(aula => {
            if (time < aula['Hora início da aula'].trim()) {
                timedays.push({ 'HoraIni': time, 'HoraFim': aula['Hora início da aula'].trim() });
            }
            time = aula['Hora fim da aula'].trim();
        });

        if (time < "22:30:00") {
            timedays.push({ 'HoraIni': time, 'HoraFim': "22:30:00" });
        }

        return timedays;
    }

    static findConflicts(data) {
        const conflicts = [];
        for (let i = 0; i < data.length; i++) {
            for (let j = i + 1; j < data.length; j++) {
                if (this.isConflicting(data[i], data[j])) {
                    conflicts.push({ source: data[i], target: data[j] });
                }
            }
        }
        return conflicts;
    }

    static isConflicting(aula1, aula2) {
        const date1 = DateConverter.convertToDate(aula1['Data da aula']);
        const date2 = DateConverter.convertToDate(aula2['Data da aula']);
        if (date1.getTime() !== date2.getTime()) {
            return false;
        }

        const start1 = aula1['Hora início da aula'];
        const end1 = aula1['Hora fim da aula'];
        const start2 = aula2['Hora início da aula'];
        const end2 = aula2['Hora fim da aula'];

        return (start1 < end2 && start2 < end1);
    }
}

