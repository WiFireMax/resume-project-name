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

            // Установка шрифта по умолчанию
            doc.setFont("helvetica");
            doc.setFontSize(12);

            let y = 20;
            const margin = 15;
            const pageWidth = doc.internal.pageSize.getWidth() - 2 * margin;
            
            // Собираем все элементы для печати
            const elements = document.querySelectorAll("h1, h2, p, li");
            
            // Добавляем заголовок
            doc.setFontSize(22);
            doc.setFont("helvetica", "bold");
            const title = document.querySelector(".resume-header h2").textContent || "Резюме";
            doc.text(title, margin, y);
            y += 15;
            
            // Описание
            doc.setFontSize(14);
            doc.setFont("helvetica", "normal");
            const description = document.querySelector(".resume-header .description").textContent;
            if (description.trim()) {
                const descLines = doc.splitTextToSize(description, pageWidth);
                doc.text(descLines, margin, y);
                y += descLines.length * 7 + 10;
            }

            // Остальные секции
            doc.setFontSize(12);
            
            elements.forEach(element => {
                if (element.closest(".resume-header")) return;
                
                let fontSize = 12;
                let fontStyle = "normal";
                let text = element.textContent.trim();
                
                if (!text) return;
                
                if (element.tagName === 'H2') {
                    fontSize = 16;
                    fontStyle = "bold";
                    y += 10; // Добавляем отступ перед заголовком
                } else if (element.tagName === 'LI') {
                    text = '• ' + text;
                }
                
                doc.setFontSize(fontSize);
                doc.setFont("helvetica", fontStyle);
                
                const lines = doc.splitTextToSize(text, pageWidth);
                
                // Проверка на переполнение страницы
                const neededSpace = lines.length * 7 + 5;
                if (y + neededSpace > doc.internal.pageSize.getHeight() - 20) {
                    doc.addPage();
                    y = 20;
                }
                
                doc.text(lines, margin, y);
                y += lines.length * 7 + 5;
            });

            doc.save("resume.pdf");
        } catch (error) {
            console.error("Ошибка генерации PDF:", error);
            alert("Произошла ошибка при генерации PDF. Пожалуйста, попробуйте снова.");
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