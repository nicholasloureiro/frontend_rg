import React from "react";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveLine } from "@nivo/line";
import "../styles/AnalyticsCharts.css";

// Gráfico de Taxa de Conversão por Atendente
export const TaxaConversaoChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container empty-chart">
        <p>Sem dados disponíveis</p>
      </div>
    );
  }

  const isMobile = window.innerWidth < 768;
  const isSmallScreen = window.innerWidth < 720;

  const chartData = data.map((item) => ({
    nome: item.nome,
    "Taxa Conversão": item.taxa_conversao || 0,
    Atendimentos: item.num_atendimentos || 0,
    Fechados: item.num_fechados || 0,
  }));

  const margins = isSmallScreen 
    ? { top: 15, right: 15, bottom: 60, left: 50 }
    : isMobile
    ? { top: 15, right: 20, bottom: 70, left: 60 }
    : { top: 20, right: 30, bottom: 80, left: 70 };

  return (
    <div className="chart-container">
      <ResponsiveBar
        data={chartData}
        keys={["Taxa Conversão"]}
        indexBy="nome"
        margin={margins}
        padding={0.3}
        colors={["var(--color-accent)"]}
        borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
        axisBottom={{
          tickRotation: -45,
          tickPadding: 5,
          tickSize: 5,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Taxa (%)",
          legendPosition: "middle",
          legendOffset: -50,
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        tooltip={(props) => (
          <div
            style={{
              background: "#333",
              padding: "8px 12px",
              borderRadius: "4px",
              color: "#FFFFFF",
              fontSize: "12px",
              border: "1px solid #555",
            }}
          >
            {props.value}%
          </div>
        )}
        theme={{
          axis: {
            domain: {
              line: {
                stroke: "#e0e0e0",
              },
            },
            ticks: {
              line: {
                stroke: "#e0e0e0",
              },
              text: {
                fill: "#555",
              },
            },
            legend: {
              text: {
                fill: "#555",
              },
            },
          },
          labels: {
            text: {
              fill: "#FFFFFF", // cor do texto
            },
          },
          grid: {
            line: {
              stroke: "#f0f0f0",
            },
          },
        }}
      />
    </div>
  );
};

// Gráfico de Total Vendido por Atendente
export const TotalVendidoChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container empty-chart">
        <p>Sem dados disponíveis</p>
      </div>
    );
  }

  const isMobile = window.innerWidth < 768;
  const isSmallScreen = window.innerWidth < 720;

  const chartData = data.map((item) => ({
    nome: item.nome,
    "Total Vendido": item.total_vendido || 0,
    Atendimentos: item.num_atendimentos || 0,
  }));

  const margins = isSmallScreen 
    ? { top: 15, right: 15, bottom: 60, left: 50 }
    : isMobile
    ? { top: 15, right: 20, bottom: 70, left: 60 }
    : { top: 20, right: 30, bottom: 80, left: 90 };

  return (
    <div className="chart-container">
      <ResponsiveBar
        data={chartData}
        keys={["Total Vendido"]}
        indexBy="nome"
        margin={margins}
        padding={0.3}
        colors={["var(--color-accent)"]}
        borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
        axisBottom={{
          tickRotation: -45,
          tickPadding: 5,
          tickSize: 5,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Valor (R$)",
          legendPosition: "middle",
          legendOffset: -70,
          format: (value) => `R$ ${(value / 1000).toFixed(1)}k`,
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        tooltip={(props) => (
          <div
            style={{
              background: "#333",
              padding: "8px 12px",
              borderRadius: "4px",
              color: "#FFFFFF",
              fontSize: "12px",
              border: "1px solid #555",
            }}
          >
            R${props.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </div>
        )}
        theme={{
          axis: {
            domain: {
              line: {
                stroke: "#e0e0e0",
              },
            },
            ticks: {
              line: {
                stroke: "#e0e0e0",
              },
              text: {
                fill: "#555",
              },
            },
            legend: {
              text: {
                fill: "#555",
              },
            },
          },
          labels: {
            text: {
              fill: "#FFFFFF", // cor do texto
            },
          },
          grid: {
            line: {
              stroke: "#f0f0f0",
            },
          },
        }}
      />
    </div>
  );
};

// Gráfico de Número de Atendimentos por Atendente
export const NumAtendimentosChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container empty-chart">
        <p>Sem dados disponíveis</p>
      </div>
    );
  }

  const isMobile = window.innerWidth < 768;
  const isSmallScreen = window.innerWidth < 720;

  const chartData = data.map((item) => ({
    nome: item.nome,
    "Atendimentos": item.num_atendimentos || 0,
  }));

  const margins = isSmallScreen 
    ? { top: 15, right: 15, bottom: 60, left: 50 }
    : isMobile
    ? { top: 15, right: 20, bottom: 70, left: 60 }
    : { top: 20, right: 30, bottom: 80, left: 70 };

  return (
    <div className="chart-container">
      <ResponsiveBar
        data={chartData}
        keys={["Atendimentos"]}
        indexBy="nome"
        margin={margins}
        padding={0.3}
        colors={["var(--color-accent)"]}
        borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
        axisBottom={{
          tickRotation: -45,
          tickPadding: 5,
          tickSize: 5,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Quantidade",
          legendPosition: "middle",
          legendOffset: -50,
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        tooltip={(props) => (
          <div
            style={{
              background: "#333",
              padding: "8px 12px",
              borderRadius: "4px",
              color: "#FFFFFF",
              fontSize: "12px",
              border: "1px solid #555",
            }}
          >
            {props.value} atendimento{props.value !== 1 ? 's' : ''}
          </div>
        )}
        theme={{
          axis: {
            domain: {
              line: {
                stroke: "#e0e0e0",
              },
            },
            ticks: {
              line: {
                stroke: "#e0e0e0",
              },
              text: {
                fill: "#555",
              },
            },
            legend: {
              text: {
                fill: "#555",
              },
            },
          },
          labels: {
            text: {
              fill: "#FFFFFF",
            },
          },
          grid: {
            line: {
              stroke: "#f0f0f0",
            },
          },
        }}
      />
    </div>
  );
};

// Gráfico de Tipo de Cliente - Total Vendido
export const TipoClienteChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container empty-chart">
        <p>Sem dados disponíveis</p>
      </div>
    );
  }

  const isMobile = window.innerWidth < 768;
  const isSmallScreen = window.innerWidth < 720;

  const margins = isSmallScreen 
    ? { top: 15, right: 15, bottom: 60, left: 50 }
    : isMobile
    ? { top: 15, right: 20, bottom: 65, left: 60 }
    : { top: 20, right: 30, bottom: 80, left: 90 };

  const chartData = data.map((item) => ({
    tipo: item.tipo,
    "Total Vendido": item.total_vendido || 0,
  }));

  return (
    <div className="chart-container">
      <ResponsiveBar
        data={chartData}
        keys={["Total Vendido"]}
        indexBy="tipo"
        margin={margins}
        padding={0.3}
        colors={["var(--color-accent)"]}
        borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
        axisBottom={{
          tickRotation: -45,
          tickPadding: 5,
          tickSize: 5,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Total Vendido (R$)",
          legendPosition: "middle",
          legendOffset: -70,
          format: (value) => `R$ ${(value / 1000).toFixed(1)}k`,
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        theme={{
          axis: {
            domain: {
              line: {
                stroke: "#e0e0e0",
              },
            },
            ticks: {
              line: {
                stroke: "#e0e0e0",
              },
              text: {
                fill: "#555",
              },
            },
            legend: {
              text: {
                fill: "#555",
              },
            },
          },
          labels: {
            text: {
              fill: "#FFFFFF",
            },
          },
          grid: {
            line: {
              stroke: "#f0f0f0",
            },
          },
        }}
        tooltip={(props) => (
          <div
            style={{
              background: "#333",
              padding: "8px 12px",
              borderRadius: "4px",
              color: "#FFFFFF",
              fontSize: "12px",
              border: "1px solid #555",
            }}
          >
            R$ {props.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </div>
        )}
      />
    </div>
  );
};

// Gráfico de Atendimentos Fechados por Tipo de Cliente
export const TipoClienteAtendimentosChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container empty-chart">
        <p>Sem dados disponíveis</p>
      </div>
    );
  }

  const isMobile = window.innerWidth < 768;
  const isSmallScreen = window.innerWidth < 720;

  const margins = isSmallScreen 
    ? { top: 15, right: 15, bottom: 60, left: 50 }
    : isMobile
    ? { top: 15, right: 20, bottom: 65, left: 60 }
    : { top: 20, right: 30, bottom: 80, left: 90 };

  const chartData = data.map((item) => ({
    tipo: item.tipo,
    "Atendimentos Fechados": item.atendimentos_fechados || 0,
  }));

  return (
    <div className="chart-container">
      <ResponsiveBar
        data={chartData}
        keys={["Atendimentos Fechados"]}
        indexBy="tipo"
        margin={margins}
        padding={0.3}
        colors={["var(--color-accent)"]}
        borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
        axisBottom={{
          tickRotation: -45,
          tickPadding: 5,
          tickSize: 5,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Quantidade",
          legendPosition: "middle",
          legendOffset: -70,
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        theme={{
          axis: {
            domain: {
              line: {
                stroke: "#e0e0e0",
              },
            },
            ticks: {
              line: {
                stroke: "#e0e0e0",
              },
              text: {
                fill: "#555",
              },
            },
            legend: {
              text: {
                fill: "#555",
              },
            },
          },
          labels: {
            text: {
              fill: "#FFFFFF",
            },
          },
          grid: {
            line: {
              stroke: "#f0f0f0",
            },
          },
        }}
        tooltip={(props) => (
          <div
            style={{
              background: "#333",
              padding: "8px 12px",
              borderRadius: "4px",
              color: "#FFFFFF",
              fontSize: "12px",
              border: "1px solid #555",
            }}
          >
            {props.value}
          </div>
        )}
      />
    </div>
  );
};

// Gráfico de Canal de Origem
export const CanalOrigemChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container empty-chart">
        <p>Sem dados disponíveis</p>
      </div>
    );
  }

  const isMobile = window.innerWidth < 768;
  const isSmallScreen = window.innerWidth < 720;

  const margins = isSmallScreen 
    ? { top: 15, right: 15, bottom: 55, left: 50 }
    : isMobile
    ? { top: 15, right: 20, bottom: 60, left: 60 }
    : { top: 20, right: 30, bottom: 70, left: 90 };

  const chartData = data.map((item) => ({
    canal: item.canal,
    "Atendimentos fechados": item.atendimentos_fechados || 0,
  }));

  return (
    <div className="chart-container">
      <ResponsiveBar
        data={chartData}
        keys={["Atendimentos fechados"]}
        indexBy="canal"
        margin={margins}
        padding={0.3}
        colors={["var(--color-accent)"]}
        borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
        axisBottom={{
          tickRotation: 0,
          tickPadding: 5,
          tickSize: 5,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Quantidade",
          legendPosition: "middle",
          legendOffset: -70,
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        tooltip={(props) => (
          <div
            style={{
              background: "#333",
              padding: "8px 12px",
              borderRadius: "4px",
              color: "#FFFFFF",
              fontSize: "12px",
              border: "1px solid #555",
            }}
          >
            {props.value}
          </div>
        )}
        theme={{
          axis: {
            domain: {
              line: {
                stroke: "#e0e0e0",
              },
            },
            ticks: {
              line: {
                stroke: "#e0e0e0",
              },
              text: {
                fill: "#555",
              },
            },
            legend: {
              text: {
                fill: "#555",
              },
            },
          },
          labels: {
            text: {
              fill: "#FFFFFF", // cor do texto
            },
          },
          grid: {
            line: {
              stroke: "#f0f0f0",
            },
          },
        }}
      />
    </div>
  );
};
