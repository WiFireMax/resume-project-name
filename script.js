document.addEventListener("DOMContentLoaded", async function () {
    // Инициализация jsPDF
    window.jspdf = window.jspdf || { jsPDF: window.jsPDF };
    const { jsPDF } = window.jspdf;

    // Функция для работы с редактируемыми элементами
    const editableElements = document.querySelectorAll("[contenteditable='true']");

    function updatePlaceholder(element) {
        element.classList.toggle("empty", element.textContent.trim() === "");
    }

    editableElements.forEach(element => {
        if (!element.dataset.placeholder) return;
        
        const key = element.dataset.placeholder;
        const savedValue = localStorage.getItem(key);
        
        if (savedValue) {
            element.textContent = savedValue;
        }
        
        updatePlaceholder(element);

        element.addEventListener("input", () => {
            localStorage.setItem(key, element.textContent);
            updatePlaceholder(element);
        });

        element.addEventListener("blur", () => updatePlaceholder(element));
        
        // Добавляем анимацию клика
        element.addEventListener("click", function(e) {
            const ripple = document.createElement("span");
            ripple.className = "ripple";
            
            const rect = this.getBoundingClientRect();
            ripple.style.left = (e.clientX - rect.left) + "px";
            ripple.style.top = (e.clientY - rect.top) + "px";
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // Функция для генерации PDF
    document.getElementById("download-pdf").addEventListener("click", function () {
    try {
        const doc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4"
        });

        // Устанавливаем стандартный шрифт с поддержкой кириллицы
        doc.setFont("helvetica");
        doc.setFontSize(12);

        let y = 20;
        const margin = 15;
        const pageWidth = doc.internal.pageSize.getWidth() - 2 * margin;

        // Функция для корректного добавления текста
        function addText(text, fontSize = 12, isBold = false, isHeader = false) {
            if (!text || !text.trim()) return y;
            
            doc.setFontSize(fontSize);
            doc.setFont("helvetica", isBold ? "bold" : "normal");
            
            const lines = doc.splitTextToSize(text.trim(), pageWidth);
            
            // Проверка на переполнение страницы
            const lineHeight = fontSize * 0.35;
            const neededSpace = lines.length * lineHeight + (isHeader ? 10 : 5);
            
            if (y + neededSpace > doc.internal.pageSize.getHeight() - 20) {
                doc.addPage();
                y = 20;
            }
            
            if (isHeader) {
                y += 10;
                doc.setTextColor(0, 0, 0);
            }
            
            doc.text(lines, margin, y);
            y += lines.length * lineHeight + (isHeader ? 10 : 5);
            
            return y;
        }

        // Добавляем заголовок
        const title = document.querySelector(".resume-header h2").textContent || "Resume";
        y = addText(title, 22, true, true);
        
        // Описание
        const description = document.querySelector(".resume-header .description").textContent;
        y = addText(description, 14, false, false);

        // Обрабатываем все секции
        document.querySelectorAll(".resume-section").forEach(section => {
            const title = section.querySelector("h2").textContent;
            y = addText(title, 16, true, true);
            
            section.querySelectorAll("p, li").forEach(element => {
                const isListItem = element.tagName === 'LI';
                y = addText(element.textContent, 12, false, false);
            });
        });

        doc.save("resume.pdf");
    } catch (error) {
        console.error("Ошибка генерации PDF:", error);
        alert("Произошла ошибка при генерации PDF: " + error.message);
    }
});

    // Эффект Ripple для кнопки
    document.querySelectorAll("button").forEach(button => {
        button.addEventListener("click", function(e) {
            // Удаляем старые ripple-эффекты
            const oldRipples = this.querySelectorAll(".ripple");
            oldRipples.forEach(ripple => ripple.remove());
            
            const ripple = document.createElement("span");
            ripple.className = "ripple";
            
            const rect = this.getBoundingClientRect();
            ripple.style.left = (e.clientX - rect.left) + "px";
            ripple.style.top = (e.clientY - rect.top) + "px";
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
});