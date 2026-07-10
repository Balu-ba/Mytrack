#!/usr/bin/env python3
"""Генератор Excel: домашняя программа 12 недель + трекер (только русский)."""

from datetime import date, timedelta

from openpyxl import Workbook
from openpyxl.chart import LineChart, Reference
from openpyxl.formatting.rule import CellIsRule
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation

START = date(2026, 7, 10)  # пятница — старт сегодня
WEEKS = 12

BASE = {
    "otzhimaniya": 10,
    "prised": 20,
    "planka_sek": 30,
}

FILL_HEADER = PatternFill("solid", fgColor="1F4E79")
FILL_VERH = PatternFill("solid", fgColor="D6EAF8")
FILL_NOGI = PatternFill("solid", fgColor="D5F5E3")
FILL_PRESS = PatternFill("solid", fgColor="FCF3CF")
FILL_KRUG = PatternFill("solid", fgColor="F5B7B1")
FILL_OTDYH = PatternFill("solid", fgColor="E8DAEF")
FILL_DONE = PatternFill("solid", fgColor="C6EFCE")
FILL_TODO = PatternFill("solid", fgColor="FFC7CE")
FILL_ALT = PatternFill("solid", fgColor="F2F2F2")
FILL_WARN = PatternFill("solid", fgColor="FFF2CC")

FONT_WHITE = Font(bold=True, color="FFFFFF", name="Calibri", size=11)
FONT_TITLE = Font(bold=True, name="Calibri", size=16, color="1F4E79")
FONT_BOLD = Font(bold=True, name="Calibri", size=11)
FONT_NORMAL = Font(name="Calibri", size=10)

THIN = Border(
    left=Side(style="thin", color="B0B0B0"),
    right=Side(style="thin", color="B0B0B0"),
    top=Side(style="thin", color="B0B0B0"),
    bottom=Side(style="thin", color="B0B0B0"),
)

# Пн=0 … Вс=6
TIPY_DNEY = [
    ("Верх", "Грудь, плечи, трицепс", FILL_VERH),
    ("Ноги", "Ноги и ягодицы", FILL_NOGI),
    ("Пресс и спина", "Живот и поясница", FILL_PRESS),
    ("Верх", "Грудь, плечи, трицепс (повтор)", FILL_VERH),
    ("Ноги", "Ноги и ягодицы (повтор)", FILL_NOGI),
    ("Круговая", "Жиросжигание, всё тело", FILL_KRUG),
    ("Лёгкий день", "Ходьба, растяжка, восстановление", FILL_OTDYH),
]

DNI_NEDELI = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]


def style_header(ws, row, cols):
    for c in range(1, cols + 1):
        cell = ws.cell(row=row, column=c)
        cell.fill = FILL_HEADER
        cell.font = FONT_WHITE
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        cell.border = THIN


def autosize(ws, widths):
    for i, w in enumerate(widths, 1):
        ws.column_dimensions[get_column_letter(i)].width = w


def koeff_nedeli(week: int) -> float:
    rabochie = [1, 2, 3, 5, 6, 7, 9, 10, 11]
    if week in (4, 8, 12):
        return koeff_nedeli(week - 1) * 0.7
    return 1.0 + 0.08 * rabochie.index(week)


def okruglit(n: float, minimum: int = 1) -> int:
    return max(minimum, int(round(n)))


def celi_nedeli(week: int) -> dict:
    f = koeff_nedeli(week)
    podhody = 3 if week < 5 else 4
    if week in (4, 8, 12):
        podhody = 2
    return {
        "koeff": f,
        "podhody": podhody,
        "otzhimaniya": okruglit(BASE["otzhimaniya"] * f),
        "prised": okruglit(BASE["prised"] * f),
        "planka": okruglit(BASE["planka_sek"] * f, 20),
        "vypady": okruglit(8 * f),
        "most": okruglit(12 * f),
        "triceps_stul": okruglit(8 * f),
        "lodochka": okruglit(10 * f),
        "skalolaz": okruglit(20 * f),
        "pryzhki": okruglit(30 * f),
        "stulchik": okruglit(30 * f, 20),
        "bok_planka": okruglit(20 * f, 15),
        "ikry": okruglit(15 * f),
        "ptica": okruglit(8 * f),
        "mertvyj_zhuk": okruglit(8 * f),
        "domikom": okruglit(6 * f),
        "burpi": okruglit(5 * f) if week >= 3 else 0,
    }


def blok_trenirovki(tip: str, t: dict) -> list[tuple[str, str, str]]:
    p = t["podhody"]
    if tip == "Верх":
        return [
            ("Разминка: круги руками + прыжки на месте", "2–3 мин", "—"),
            ("Отжимания (можно с колен)", f"{p}×{t['otzhimaniya']}", "60–90 сек"),
            ("Отжимания узким хватом (ладони ближе)", f"{max(2, p-1)}×{max(5, t['otzhimaniya']-2)}", "60 сек"),
            ("Отжимания от стула на трицепс (спиной к стулу)", f"{p}×{t['triceps_stul']}", "60 сек"),
            ("Отжимания «домиком» (таз вверх, на плечи)", f"{max(2, p-1)}×{t['domikom']}", "60 сек"),
            ("Планка", f"{p}×{t['planka']} сек", "45 сек"),
            ("Добивка: «скалолаз» (колени к груди в упоре)", f"2×{t['skalolaz']}", "45 сек"),
        ]
    if tip == "Ноги":
        return [
            ("Разминка: марш на месте + круги тазом", "2–3 мин", "—"),
            ("Приседания", f"{p}×{t['prised']}", "60–90 сек"),
            ("Выпады назад (на каждую ногу)", f"{p}×{t['vypady']}", "60 сек"),
            ("Ягодичный мост (лёжа, таз вверх)", f"{p}×{t['most']}", "45 сек"),
            ("Подъёмы на носки", f"{p}×{t['ikry']}", "30 сек"),
            ("Стульчик у стены (спина к стене, бёдра параллельно)", f"{max(2, p-1)}×{t['stulchik']} сек", "60 сек"),
            ("Добивка: приседания", f"2×{max(10, t['prised']//2)}", "45 сек"),
        ]
    if tip == "Пресс и спина":
        return [
            ("Разминка: «кошка-корова» + наклоны", "2–3 мин", "—"),
            ("Лодочка на животе (руки и ноги вверх)", f"{p}×{t['lodochka']}", "45 сек"),
            ("Птица-собака (на четвереньках рука+нога)", f"{p}×{t['ptica']} на сторону", "30 сек"),
            ("Мёртвый жук (лёжа, поясница прижата)", f"{p}×{t['mertvyj_zhuk']} на сторону", "30 сек"),
            ("Планка", f"{p}×{t['planka']} сек", "45 сек"),
            ("Боковая планка", f"2×{t['bok_planka']} сек на сторону", "30 сек"),
            ("Обратные скручивания (таз к груди лёжа)", f"{p}×{max(8, t['most']-2)}", "45 сек"),
        ]
    if tip == "Круговая":
        krugi = 3 if t["podhody"] <= 3 else 4
        if t["koeff"] < 0.85:
            krugi = 2
        if t["burpi"]:
            burpi = ("Упрощённые бёрпи (шаг назад вместо прыжка)", f"{krugi}×{t['burpi']}", "45 сек")
        else:
            burpi = ("Шаг назад в планку и обратно", f"{krugi}×6", "45 сек")
        return [
            ("Круговая: упражнения подряд, отдых между кругами", f"{krugi} круга", "90 сек между кругами"),
            ("Прыжки ноги врозь — руки вверх (или шаги без прыжка)", f"{krugi}×{t['pryzhki']}", "15 сек"),
            ("Приседания", f"{krugi}×{max(12, t['prised']-4)}", "15 сек"),
            ("Отжимания", f"{krugi}×{max(6, t['otzhimaniya']-2)}", "15 сек"),
            ("«Скалолаз»", f"{krugi}×{t['skalolaz']}", "15 сек"),
            burpi,
            ("Планка в конце", f"1×{t['planka']} сек", "—"),
        ]
    # Лёгкий день
    return [
        ("Ходьба дома или на улице", "20–30 мин", "—"),
        ("Разминка суставов: бёдра, грудь, плечи", "8–10 мин", "—"),
        ("Лёгкая планка или птица-собака", f"2×{max(20, t['planka']-10)} сек / 2×6", "—"),
        ("Растяжка всего тела", "8–10 мин", "—"),
        ("Цель по шагам за день", "8000–10000 шагов", "—"),
    ]


def build():
    wb = Workbook()

    # ----- Старт -----
    ws = wb.active
    ws.title = "Старт_и_правила"
    ws["A1"] = "Домашний фитнес-трекер: похудение + объём мышц"
    ws["A1"].font = FONT_TITLE
    ws.merge_cells("A1:B1")

    rules = [
        ("Старт", f"{START.strftime('%d.%m.%Y')} (пятница) — отмечай дни в листах «Трекер» и «Чеклист»"),
        ("Инвентарь", "Только своё тело + стул для отжиманий на трицепс"),
        ("Твой старт", f"Отжимания {BASE['otzhimaniya']}, приседания {BASE['prised']}, планка {BASE['planka_sek']} сек"),
        ("Как часто", "Каждый день, но разные мышцы — так можно без перегруза"),
        ("Неделя", "Пн Верх → Вт Ноги → Ср Пресс и спина → Чт Верх → Пт Ноги → Сб Круговая → Вс Лёгкий день"),
        ("Рост нагрузки", "Каждую неделю чуть больше повторов/секунд (~+8%). Недели 4, 8, 12 — легче (разгрузка)"),
        ("Галочка", "Отмечай только в «Трекер_тренировок». Лист «Сводка_по_дням» заполняется сам"),
        ("Техника", "Лучше меньше, но чисто. Отжимания с колен на старте — нормально"),
        ("Похудение", "Минус 300–500 ккал от обычного рациона + белок + 8–10 тысяч шагов"),
        ("Мышцы", "Подходы почти до отказа (остаётся 1–3 повтора), сон 7–8 часов"),
        ("Если болит сустав", "Не терпи. Пропусти или сделай облегчённый вариант"),
        ("Замеры", "Раз в 7 дней утром натощак одной и той же лентой"),
    ]
    ws["A3"] = "Параметр"
    ws["B3"] = "Значение"
    style_header(ws, 3, 2)
    for i, (k, v) in enumerate(rules, 4):
        ws.cell(row=i, column=1, value=k).font = FONT_BOLD
        ws.cell(row=i, column=2, value=v).alignment = Alignment(wrap_text=True)
        for c in range(1, 3):
            ws.cell(row=i, column=c).border = THIN
            if i % 2 == 0:
                ws.cell(row=i, column=c).fill = FILL_ALT
    autosize(ws, [22, 100])
    ws.row_dimensions[1].height = 28
    for r in range(4, 16):
        ws.row_dimensions[r].height = 34

    # ----- Упражнения -----
    ws2 = wb.create_sheet("Упражнения")
    ws2["A1"] = "Список упражнений (без железа)"
    ws2["A1"].font = FONT_TITLE
    headers2 = ["Упражнение", "Что качает", "Как делать", "Легче", "Сложнее"]
    for i, h in enumerate(headers2, 1):
        ws2.cell(row=3, column=i, value=h)
    style_header(ws2, 3, 5)

    catalog = [
        ("Отжимания", "Грудь, трицепс, плечи", "Корпус прямой, локти ~45°, грудь почти к полу", "С колен / от стола", "Пауза внизу / ноги выше"),
        ("Отжимания узким хватом", "Трицепс, грудь", "Ладони ближе под грудью", "С колен", "Медленно вниз 3 сек"),
        ("Отжимания от стула на трицепс", "Трицепс", "Спиной к стулу, таз опускать вниз", "Ноги ближе", "Ноги дальше"),
        ("Отжимания «домиком»", "Плечи", "Таз вверх, голова к полу между руками", "Меньший угол / от стола", "Ноги выше"),
        ("Приседания", "Бёдра, ягодицы", "Носки чуть врозь, колени по носкам", "Сесть на стул и встать", "Пауза внизу"),
        ("Выпады назад", "Ягодицы, ноги", "Шаг назад, колено почти к полу", "Держаться за стул", "Пульсация внизу"),
        ("Ягодичный мост", "Ягодицы", "Лёжа, пятки под коленями, таз вверх", "Меньше амплитуда", "На одной ноге"),
        ("Стульчик у стены", "Ноги", "Спина к стене, бёдра параллельно полу", "Выше / короче", "Дольше / руки вверх"),
        ("Подъёмы на носки", "Икры", "Полная амплитуда, пауза вверху", "Двумя ногами", "Одной ногой"),
        ("Планка", "Живот, кор", "Локти под плечами, таз не провисает", "С колен", "Дольше"),
        ("Боковая планка", "Косые мышцы живота", "На локте, тело в линию", "Колено на полу", "Таз вверх-вниз"),
        ("Лодочка на животе", "Поясница", "Руки и ноги вверх, короткая пауза", "Только руки или ноги", "Дольше держать"),
        ("Птица-собака", "Живот, спина", "На четвереньках: противоположные рука и нога", "Меньше амплитуда", "Пауза 2–3 сек"),
        ("Мёртвый жук", "Глубокий живот", "Лёжа, поясница прижата, рука+нога", "Только ноги", "Медленнее"),
        ("«Скалолаз»", "Живот + дыхание", "В упоре колени к груди по очереди", "Медленно", "Быстрее"),
        ("Прыжки ноги врозь", "Дыхание, жир", "Прыжок ноги врозь + руки вверх", "Шаги без прыжка", "Быстрее"),
        ("Бёрпи (упрощённые)", "Всё тело", "Присед → планка → встать (без прыжка ок)", "Без отжимания и прыжка", "Полный вариант"),
        ("Ходьба", "Жиросжигание", "Быстрый шаг", "Короче", "Быстрее / в горку"),
    ]
    for r, row in enumerate(catalog, 4):
        for c, val in enumerate(row, 1):
            cell = ws2.cell(row=r, column=c, value=val)
            cell.border = THIN
            cell.alignment = Alignment(wrap_text=True, vertical="top")
            cell.font = FONT_NORMAL
            if r % 2 == 0:
                cell.fill = FILL_ALT
    autosize(ws2, [32, 22, 48, 26, 28])
    for r in range(4, 4 + len(catalog)):
        ws2.row_dimensions[r].height = 40

    # ----- Программа -----
    ws3 = wb.create_sheet("Программа_12_недель")
    ws3["A1"] = "Цели по неделям (ориентир)"
    ws3["A1"].font = FONT_TITLE
    headers3 = [
        "Неделя",
        "Режим",
        "Подходы",
        "Отжимания",
        "Приседания",
        "Планка (сек)",
        "Выпады / нога",
        "Мост",
        "Трицепс от стула",
        "Скалолаз",
        "Стульчик (сек)",
        "Бёрпи",
        "Примечание",
    ]
    for i, h in enumerate(headers3, 1):
        ws3.cell(row=3, column=i, value=h)
    style_header(ws3, 3, len(headers3))

    for week in range(1, WEEKS + 1):
        t = celi_nedeli(week)
        note = "Разгрузка — легче, следи за техникой и сном" if week in (4, 8, 12) else "Рабочая неделя: чуть тяжелее прошлой"
        row = [
            week,
            "Разгрузка" if week in (4, 8, 12) else "Рост",
            t["podhody"],
            t["otzhimaniya"],
            t["prised"],
            t["planka"],
            t["vypady"],
            t["most"],
            t["triceps_stul"],
            t["skalolaz"],
            t["stulchik"],
            t["burpi"] or "—",
            note,
        ]
        r = 3 + week
        for c, val in enumerate(row, 1):
            cell = ws3.cell(row=r, column=c, value=val)
            cell.border = THIN
            cell.alignment = Alignment(horizontal="center", wrap_text=True)
            if week in (4, 8, 12):
                cell.fill = FILL_WARN
            elif week % 2 == 0:
                cell.fill = FILL_ALT
    autosize(ws3, [10, 12, 10, 12, 12, 12, 12, 10, 14, 10, 12, 10, 42])
    ws3["A17"] = "Как самому поднимать нагрузку:"
    ws3["A17"].font = FONT_BOLD
    ws3["A18"] = (
        "Сделал все подходы легко → в следующий раз +1–2 повтора или +5 сек планки. "
        "Не добил 2 и больше подхода → останься на тех же цифрах ещё неделю. "
        "Отжимания: сначала уверенно с колен, потом полные."
    )
    ws3["A18"].alignment = Alignment(wrap_text=True)
    ws3.merge_cells("A18:M18")
    ws3.row_dimensions[18].height = 48

    # ----- Трекер -----
    ws4 = wb.create_sheet("Трекер_тренировок")
    ws4["A1"] = "Трекер: после упражнения ставь «Да» в колонке «Сделано»"
    ws4["A1"].font = FONT_TITLE
    ws4.merge_cells("A1:L1")

    headers4 = [
        "Дата",
        "День",
        "Неделя",
        "Тип",
        "Фокус",
        "Упражнение",
        "Цель",
        "Отдых",
        "Факт (сколько сделал)",
        "Сделано",
        "Тяжесть 1–10",
        "Заметки",
    ]
    for i, h in enumerate(headers4, 1):
        ws4.cell(row=3, column=i, value=h)
    style_header(ws4, 3, len(headers4))

    dv_done = DataValidation(type="list", formula1='"Да,Нет"', allow_blank=True)
    ws4.add_data_validation(dv_done)

    row = 4
    for week in range(1, WEEKS + 1):
        t = celi_nedeli(week)
        for d in range(7):
            day_date = START + timedelta(days=(week - 1) * 7 + d)
            tip, fokus, fill = TIPY_DNEY[day_date.weekday()]
            for upr, cel, otdyh in blok_trenirovki(tip, t):
                values = [
                    day_date.strftime("%d.%m.%Y"),
                    DNI_NEDELI[day_date.weekday()],
                    week,
                    tip,
                    fokus,
                    upr,
                    cel,
                    otdyh,
                    "",
                    "Нет",
                    "",
                    "",
                ]
                for c, val in enumerate(values, 1):
                    cell = ws4.cell(row=row, column=c, value=val)
                    cell.border = THIN
                    cell.font = FONT_NORMAL
                    cell.alignment = Alignment(vertical="center", wrap_text=True)
                    if c <= 5:
                        cell.fill = fill
                dv_done.add(ws4.cell(row=row, column=10))
                row += 1

    last_row = row - 1
    ws4.conditional_formatting.add(
        f"J4:J{last_row}",
        CellIsRule(operator="equal", formula=['"Да"'], fill=FILL_DONE),
    )
    ws4.conditional_formatting.add(
        f"J4:J{last_row}",
        CellIsRule(operator="equal", formula=['"Нет"'], fill=FILL_TODO),
    )
    autosize(ws4, [12, 6, 8, 14, 30, 58, 20, 22, 18, 10, 12, 24])
    ws4.auto_filter.ref = f"A3:L{last_row}"
    ws4.freeze_panes = "A4"

    ws4["N1"] = "Сводка"
    ws4["N1"].font = FONT_BOLD
    ws4["N3"] = "Всего строк"
    ws4["O3"] = f"=COUNTA(A4:A{last_row})"
    ws4["N4"] = "Сделано (Да)"
    ws4["O4"] = f'=COUNTIF(J4:J{last_row},"Да")'
    ws4["N5"] = "Процент"
    ws4["O5"] = f"=IF(O3=0,0,O4/O3)"
    ws4["O5"].number_format = "0.0%"
    ws4["N6"] = "Осталось"
    ws4["O6"] = f"=O3-O4"
    ws4.column_dimensions["N"].width = 16
    ws4.column_dimensions["O"].width = 12

    # ----- Замеры -----
    ws5 = wb.create_sheet("Замеры_тела")
    ws5["A1"] = "Вес и обхваты (раз в неделю, утром)"
    ws5["A1"].font = FONT_TITLE
    ws5.merge_cells("A1:P1")

    measure_headers = [
        "Дата",
        "Неделя",
        "Вес (кг)",
        "Шея (см)",
        "Плечи (см)",
        "Грудь (см)",
        "Левый бицепс (см)",
        "Правый бицепс (см)",
        "Талия (см)",
        "Живот (см)",
        "Бёдра (см)",
        "Левое бедро (см)",
        "Правое бедро (см)",
        "Левая икра (см)",
        "Правая икра (см)",
        "Фото?",
        "Заметки",
    ]
    for i, h in enumerate(measure_headers, 1):
        ws5.cell(row=3, column=i, value=h)
    style_header(ws5, 3, len(measure_headers))

    dv_photo = DataValidation(type="list", formula1='"Да,Нет"', allow_blank=True)
    ws5.add_data_validation(dv_photo)

    for week in range(0, WEEKS + 1):
        r = 4 + week
        measure_date = START + timedelta(days=week * 7)
        ws5.cell(row=r, column=1, value=measure_date.strftime("%d.%m.%Y")).border = THIN
        ws5.cell(row=r, column=2, value="Старт" if week == 0 else week).border = THIN
        for c in range(3, len(measure_headers) + 1):
            cell = ws5.cell(row=r, column=c, value="")
            cell.border = THIN
            if week % 2 == 0:
                cell.fill = FILL_ALT
        dv_photo.add(ws5.cell(row=r, column=16))
        if week % 2 == 0:
            ws5.cell(row=r, column=1).fill = FILL_ALT
            ws5.cell(row=r, column=2).fill = FILL_ALT

    autosize(ws5, [12, 10, 10, 11, 12, 11, 16, 16, 11, 11, 11, 14, 14, 13, 13, 10, 24])
    ws5.freeze_panes = "A4"

    ws5["A18"] = "Изменение к старту (заполнится само после замеров на 12-й неделе)"
    ws5["A18"].font = FONT_BOLD
    ws5["A19"] = "Изменение веса"
    ws5["B19"] = '=IF(OR(C4="",C16=""),"",C16-C4)'
    ws5["A20"] = "Изменение талии"
    ws5["B20"] = '=IF(OR(I4="",I16=""),"",I16-I4)'
    ws5["A21"] = "Изменение плеч"
    ws5["B21"] = '=IF(OR(E4="",E16=""),"",E16-E4)'
    ws5["A22"] = "Изменение бицепса (среднее)"
    ws5["B22"] = '=IF(OR(G4="",H4="",G16="",H16=""),"",((G16+H16)/2)-((G4+H4)/2))'

    tip_row = 24
    ws5.cell(row=tip_row, column=1, value="Как мерить").font = FONT_BOLD
    tips = [
        "Вес: утром после туалета, до еды, одни и те же весы.",
        "Плечи: самая широкая точка через плечи, лента ровно.",
        "Грудь: по самой широкой точке, на выдохе.",
        "Талия: самый узкий участок выше пупка.",
        "Живот: на уровне пупка.",
        "Бёдра: самая широкая точка ягодиц.",
        "Бицепс: самая толстая часть руки (всегда одинаково — расслабленно или в напряжении).",
        "Бедро: середина между пахом и коленом.",
        "Икра: самая толстая точка.",
        "Фото: спереди / сбоку / сзади, одно освещение — раз в 2 недели.",
    ]
    for i, tip in enumerate(tips):
        cell = ws5.cell(row=tip_row + 1 + i, column=1, value=tip)
        cell.alignment = Alignment(wrap_text=True)
        ws5.merge_cells(
            start_row=tip_row + 1 + i,
            start_column=1,
            end_row=tip_row + 1 + i,
            end_column=8,
        )

    chart = LineChart()
    chart.title = "Вес (кг)"
    chart.style = 10
    chart.y_axis.title = "кг"
    chart.x_axis.title = "Дата"
    data = Reference(ws5, min_col=3, min_row=3, max_row=16)
    cats = Reference(ws5, min_col=1, min_row=4, max_row=16)
    chart.add_data(data, titles_from_data=True)
    chart.set_categories(cats)
    chart.width = 15
    chart.height = 8
    ws5.add_chart(chart, "A37")

    # ----- Сводка по дням (авто из трекера) -----
    ws6 = wb.create_sheet("Сводка_по_дням")
    ws6["A1"] = (
        "Сводка по дням — сама из трекера. Пиши «Да» только в «Трекер_тренировок». "
        "День закрыт («Да»), если сделано ≥80% упражнений. "
        "Меньше — «Частично». Ноль — «Нет». Одно пропущенное упражнение день НЕ проваливает."
    )
    ws6["A1"].font = FONT_TITLE
    ws6["A1"].alignment = Alignment(wrap_text=True)
    ws6.merge_cells("A1:G1")
    ws6.row_dimensions[1].height = 48

    headers6 = [
        "Дата",
        "День",
        "Неделя",
        "Тип",
        "Всего упражнений",
        "Сделано",
        "Статус дня",
    ]
    for i, h in enumerate(headers6, 1):
        ws6.cell(row=3, column=i, value=h)
    style_header(ws6, 3, len(headers6))

    tracker = "Трекер_тренировок"
    a_rng = f"'{tracker}'!$A$4:$A${last_row}"
    j_rng = f"'{tracker}'!$J$4:$J${last_row}"

    for i in range(WEEKS * 7):
        day_date = START + timedelta(days=i)
        tip, _, fill = TIPY_DNEY[day_date.weekday()]
        week = i // 7 + 1
        r = 4 + i
        date_str = day_date.strftime("%d.%m.%Y")

        ws6.cell(row=r, column=1, value=date_str).border = THIN
        ws6.cell(row=r, column=2, value=DNI_NEDELI[day_date.weekday()]).border = THIN
        ws6.cell(row=r, column=3, value=week).border = THIN
        tip_cell = ws6.cell(row=r, column=4, value=tip)
        tip_cell.border = THIN
        tip_cell.fill = fill

        total_f = f'=COUNTIF({a_rng},A{r})'
        done_f = f'=COUNTIFS({a_rng},A{r},{j_rng},"Да")'
        # ≥80% = Да; >0 но <80% = Частично; 0 = Нет
        status_f = (
            f'=IF(E{r}=0,"",'
            f'IF(F{r}=0,"Нет",'
            f'IF(F{r}/E{r}>=0.8,"Да","Частично")))'
        )

        for c, formula in ((5, total_f), (6, done_f), (7, status_f)):
            cell = ws6.cell(row=r, column=c, value=formula)
            cell.border = THIN
            cell.alignment = Alignment(horizontal="center")

        for c in range(1, 4):
            ws6.cell(row=r, column=c).fill = fill

    end_r = 3 + WEEKS * 7
    ws6.conditional_formatting.add(
        f"G4:G{end_r}",
        CellIsRule(operator="equal", formula=['"Да"'], fill=FILL_DONE),
    )
    ws6.conditional_formatting.add(
        f"G4:G{end_r}",
        CellIsRule(operator="equal", formula=['"Частично"'], fill=FILL_WARN),
    )
    ws6.conditional_formatting.add(
        f"G4:G{end_r}",
        CellIsRule(operator="equal", formula=['"Нет"'], fill=FILL_TODO),
    )

    ws6[f"A{end_r + 2}"] = "Дней полностью (≥80%)"
    ws6[f"A{end_r + 2}"].font = FONT_BOLD
    ws6[f"B{end_r + 2}"] = f'=COUNTIF(G4:G{end_r},"Да")'
    ws6[f"A{end_r + 3}"] = "Дней частично"
    ws6[f"A{end_r + 3}"].font = FONT_BOLD
    ws6[f"B{end_r + 3}"] = f'=COUNTIF(G4:G{end_r},"Частично")'
    ws6[f"A{end_r + 4}"] = "Процент закрытых дней"
    ws6[f"A{end_r + 4}"].font = FONT_BOLD
    ws6[f"B{end_r + 4}"] = f"=B{end_r + 2}/{WEEKS * 7}"
    ws6[f"B{end_r + 4}"].number_format = "0.0%"

    autosize(ws6, [12, 8, 10, 16, 18, 12, 14])
    ws6.freeze_panes = "A4"
    ws6.auto_filter.ref = f"A3:G{end_r}"

    # ----- Питание -----
    ws7 = wb.create_sheet("Питание_кратко")
    ws7["A1"] = "Минимум для похудения и мышц дома"
    ws7["A1"].font = FONT_TITLE
    food = [
        ("Калории", "Минус 300–500 ккал от обычного. Сильнее резать не надо — сольёшь мышцы."),
        ("Белок", "1,6–2,2 г на кг веса. В каждый приём: мясо, рыба, яйца, творог, бобовые."),
        ("Углеводы", "Около тренировки: рис, гречка, овсянка, фрукты, хлеб."),
        ("Жиры", "Не убирай: яйца, орехи, масло, рыба — нужны для гормонов и сытости."),
        ("Вода", "30–40 мл на кг веса. Часто хочется есть, когда хочется пить."),
        ("Шаги", "8–12 тысяч в день — главный помощник в сжигании жира."),
        ("Алкоголь", "Мешает сну и восстановлению — лучше убрать или сильно сократить."),
        ("Весы", "Смотри тренд раз в неделю. Скачки ±1–2 кг за день — это вода, не жир."),
    ]
    ws7["A3"] = "Тема"
    ws7["B3"] = "Практика"
    style_header(ws7, 3, 2)
    for i, (k, v) in enumerate(food, 4):
        ws7.cell(row=i, column=1, value=k).font = FONT_BOLD
        ws7.cell(row=i, column=2, value=v).alignment = Alignment(wrap_text=True)
        for c in range(1, 3):
            ws7.cell(row=i, column=c).border = THIN
    autosize(ws7, [14, 95])

    out = "Домашний_фитнес_трекер_12_недель.xlsx"
    wb.save(out)
    print(f"Сохранено: {out}, строк в трекере: {last_row - 3}")


if __name__ == "__main__":
    build()
