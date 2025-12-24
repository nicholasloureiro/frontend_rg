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

  const chartData = data
    .filter((item) => item.num_fechados > 0 || item.taxa_conversao > 0)
    .map((item) => ({
      nome: item.nome,
      "Taxa Conversão": item.taxa_conversao || 0,
      Atendimentos: item.num_fechados || 0,
      Fechados: item.num_fechados || 0,
    }));

  const margins = isSmallScreen 
    ? { top: 15, right: 15, bottom: 70, left: 50 }
    : isMobile
    ? { top: 15, right: 20, bottom: 80, left: 60 }
    : { top: 20, right: 30, bottom: 90, left: 70 };

  return (
    <div className="chart-container">
      <ResponsiveBar
        data={chartData}
        keys={["Taxa Conversão"]}
        indexBy="nome"
        margin={margins}
        padding={0.3}
        colors={["#2C5F7E"]}
        borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
        axisBottom={{
          tickRotation: -35,
          tickPadding: 8,
          tickSize: 5,
          renderTick: (tick) => (
            <g transform={`translate(${tick.x},${tick.y})`}>
              <text
                transform={`rotate(-35)`}
                textAnchor="end"
                dominantBaseline="middle"
                style={{
                  fontSize: 11,
                  fill: '#555',
                }}
                title={tick.value}
              >
                {tick.value}
              </text>
            </g>
          ),
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
              width: 'max-content',
            }}
          >
            <div style={{ marginBottom: '4px', fontWeight: '600' }}>{props.indexValue}</div>
            <div>Taxa de Conversão: {props.value}%</div>
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

  const chartData = data
    .filter((item) => item.total_vendido > 0)
    .map((item) => ({
      nome: item.nome,
      "Total Vendido": item.total_vendido || 0,
      Atendimentos: item.num_fechados || 0,
    }));

  const margins = isSmallScreen 
    ? { top: 15, right: 15, bottom: 70, left: 50 }
    : isMobile
    ? { top: 15, right: 20, bottom: 80, left: 60 }
    : { top: 20, right: 30, bottom: 90, left: 90 };

  return (
    <div className="chart-container">
      <ResponsiveBar
        data={chartData}
        keys={["Total Vendido"]}
        indexBy="nome"
        margin={margins}
        padding={0.3}
        colors={["#1F3B4D"]}
        borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
        axisBottom={{
          tickRotation: -35,
          tickPadding: 8,
          tickSize: 5,
          renderTick: (tick) => (
            <g transform={`translate(${tick.x},${tick.y})`}>
              <text
                transform={`rotate(-35)`}
                textAnchor="end"
                dominantBaseline="middle"
                style={{
                  fontSize: 11,
                  fill: '#555',
                }}
                title={tick.value}
              >
                {tick.value}
              </text>
            </g>
          ),
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
               width: 'max-content',
            }}
          >
            <div style={{ marginBottom: '4px', fontWeight: '600' }}>{props.indexValue}</div>
            <div>Total Vendido: R$ {props.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
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

  const chartData = data
    .filter((item) => item.num_fechados > 0)
    .map((item) => ({
      nome: item.nome,
      "Atendimentos": item.num_fechados || 0,
    }));

  const margins = isSmallScreen 
    ? { top: 15, right: 15, bottom: 70, left: 50 }
    : isMobile
    ? { top: 15, right: 20, bottom: 80, left: 60 }
    : { top: 20, right: 30, bottom: 90, left: 70 };

  return (
    <div className="chart-container">
      <ResponsiveBar
        data={chartData}
        keys={["Atendimentos"]}
        indexBy="nome"
        margin={margins}
        padding={0.3}
        colors={["#3A7CA5"]}
        borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
        axisBottom={{
          tickRotation: -35,
          tickPadding: 8,
          tickSize: 5,
          renderTick: (tick) => (
            <g transform={`translate(${tick.x},${tick.y})`}>
              <text
                transform={`rotate(-35)`}
                textAnchor="end"
                dominantBaseline="middle"
                style={{
                  fontSize: 11,
                  fill: '#555',
                }}
                title={tick.value}
              >
                {tick.value}
              </text>
            </g>
          ),
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
               width: 'max-content',
            }}
          >
            <div style={{ marginBottom: '4px', fontWeight: '600' }}>{props.indexValue}</div>
            <div>Atendimento{props.value !== 1 ? 's' : ''}: {props.value}</div>
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
    ? { top: 15, right: 15, bottom: 70, left: 50 }
    : isMobile
    ? { top: 15, right: 20, bottom: 75, left: 60 }
    : { top: 20, right: 30, bottom: 85, left: 90 };

  const chartData = data
    .filter((item) => item.total_vendido > 0)
    .map((item) => ({
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
        colors={["#4A90B8"]}
        borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
        axisBottom={{
          tickRotation: -35,
          tickPadding: 8,
          tickSize: 5,
          renderTick: (tick) => (
            <g transform={`translate(${tick.x},${tick.y})`}>
              <text
                transform={`rotate(-35)`}
                textAnchor="end"
                dominantBaseline="middle"
                style={{
                  fontSize: 11,
                  fill: '#555',
                }}
                title={tick.value}
              >
                {tick.value}
              </text>
            </g>
          ),
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
              width: 'max-content',
            }}
          >
            <p style={{fontWeight: '600'}}>{props.indexValue}</p>
            <p>R$ {props.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
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
    ? { top: 15, right: 15, bottom: 70, left: 50 }
    : isMobile
    ? { top: 15, right: 20, bottom: 75, left: 60 }
    : { top: 20, right: 30, bottom: 85, left: 90 };

  const chartData = data
    .filter((item) => item.atendimentos_fechados > 0)
    .map((item) => ({
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
        colors={["#5BA3C5"]}
        borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
        axisBottom={{
          tickRotation: -35,
          tickPadding: 8,
          tickSize: 5,
          renderTick: (tick) => (
            <g transform={`translate(${tick.x},${tick.y})`}>
              <text
                transform={`rotate(-35)`}
                textAnchor="end"
                dominantBaseline="middle"
                style={{
                  fontSize: 11,
                  fill: '#555',
                }}
                title={tick.value}
              >
                {tick.value}
              </text>
            </g>
          ),
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
            <p style={{fontWeight: '600'}}>{props.indexValue}</p>
            <p> {props.value}</p>
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

  const chartData = data
    .filter((item) => item.atendimentos_fechados > 0)
    .map((item) => ({
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
        colors={["#476D84"]}
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
            <p style={{fontWeight: '600'}}>{props.indexValue}</p>
            <p> {props.value}</p>
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

// Gráfico de Aluguel/Venda - Valor Total
export const AluguelVendaValorChart = ({ data = [] }) => {
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
    ? { top: 15, right: 15, bottom: 70, left: 50 }
    : isMobile
    ? { top: 15, right: 20, bottom: 75, left: 60 }
    : { top: 20, right: 30, bottom: 85, left: 90 };

  const chartData = data.map((item) => ({
    tipo: item.tipo,
    "Valor Total": item.valor_total || 0,
  }));

  return (
    <div className="chart-container">
      <ResponsiveBar
        data={chartData}
        keys={["Valor Total"]}
        indexBy="tipo"
        margin={margins}
        padding={0.3}
        colors={["#1F3B4D"]}
        borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
        axisBottom={{
          tickRotation: -35,
          tickPadding: 8,
          tickSize: 5,
          renderTick: (tick) => (
            <g transform={`translate(${tick.x},${tick.y})`}>
              <text
                transform={`rotate(-35)`}
                textAnchor="end"
                dominantBaseline="middle"
                style={{
                  fontSize: 11,
                  fill: '#555',
                }}
                title={tick.value}
              >
                {tick.value}
              </text>
            </g>
          ),
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Valor Total (R$)",
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
              width: 'max-content',
            }}
          >
            <p style={{fontWeight: '600', marginBottom: '4px'}}>{props.indexValue}</p>
            <p>Valor Total: R$ {props.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          </div>
        )}
      />
    </div>
  );
};

// Gráfico de Aluguel/Venda - Quantidade de OS
export const AluguelVendaQuantidadeChart = ({ data = [] }) => {
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
    ? { top: 15, right: 15, bottom: 70, left: 50 }
    : isMobile
    ? { top: 15, right: 20, bottom: 75, left: 60 }
    : { top: 20, right: 30, bottom: 85, left: 70 };

  const chartData = data.map((item) => ({
    tipo: item.tipo,
    "Quantidade OS": item.quantidade_os || 0,
  }));

  return (
    <div className="chart-container">
      <ResponsiveBar
        data={chartData}
        keys={["Quantidade OS"]}
        indexBy="tipo"
        margin={margins}
        padding={0.3}
        colors={["#3A7CA5"]}
        borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
        axisBottom={{
          tickRotation: -35,
          tickPadding: 8,
          tickSize: 5,
          renderTick: (tick) => (
            <g transform={`translate(${tick.x},${tick.y})`}>
              <text
                transform={`rotate(-35)`}
                textAnchor="end"
                dominantBaseline="middle"
                style={{
                  fontSize: 11,
                  fill: '#555',
                }}
                title={tick.value}
              >
                {tick.value}
              </text>
            </g>
          ),
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
              width: 'max-content',
            }}
          >
            <p style={{fontWeight: '600', marginBottom: '4px'}}>{props.indexValue}</p>
            <p>Quantidade de OS: {props.value}</p>
          </div>
        )}
      />
    </div>
  );
};

// Gráfico de Aluguel/Venda - Ticket Médio
export const AluguelVendaTicketMedioChart = ({ data = [] }) => {
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
    ? { top: 15, right: 15, bottom: 70, left: 50 }
    : isMobile
    ? { top: 15, right: 20, bottom: 75, left: 60 }
    : { top: 20, right: 30, bottom: 85, left: 90 };

  const chartData = data.map((item) => ({
    tipo: item.tipo,
    "Ticket Médio": item.valor_medio || 0,
  }));

  return (
    <div className="chart-container">
      <ResponsiveBar
        data={chartData}
        keys={["Ticket Médio"]}
        indexBy="tipo"
        margin={margins}
        padding={0.3}
        colors={["#2C5F7E"]}
        borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
        axisBottom={{
          tickRotation: -35,
          tickPadding: 8,
          tickSize: 5,
          renderTick: (tick) => (
            <g transform={`translate(${tick.x},${tick.y})`}>
              <text
                transform={`rotate(-35)`}
                textAnchor="end"
                dominantBaseline="middle"
                style={{
                  fontSize: 11,
                  fill: '#555',
                }}
                title={tick.value}
              >
                {tick.value}
              </text>
            </g>
          ),
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Ticket Médio (R$)",
          legendPosition: "middle",
          legendOffset: -70,
          format: (value) => `R$ ${(value / 1000).toFixed(2)}k`,
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        valueFormat={(value) => value.toFixed(2)}
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
              width: 'max-content',
            }}
          >
            <p style={{fontWeight: '600', marginBottom: '4px'}}>{props.indexValue}</p>
            <p>Ticket Médio: R$ {props.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          </div>
        )}
      />
    </div>
  );
};

