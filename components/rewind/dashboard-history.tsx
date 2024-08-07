"use client";
import React, { useMemo, useState } from "react";
import { format } from "date-fns";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { parseGpuInfo } from "@/utils/nodes";
import { NodeCard } from "@/components/nodeCard/node-card";
import { DateTimePicker } from "@/components/date-time";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(
      errorData.message || "An error occurred while fetching the data."
    );
  }
  return res.json();
};

const DashboardHistory = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [selectedTime, setSelectedTime] = useState<string | undefined>();

  const { data: historicalData, error } = useSWR(
    selectedDate && selectedTime
      ? `/api/rewind?date=${format(
          selectedDate,
          "yyyy-MM-dd"
        )}&time=${selectedTime}`
      : null,
    fetcher
  );
  const systems: Node[] = historicalData?.nodes || [];
  const totalCpuNodes = useMemo(
    () => systems.filter((node: any) => !node.gres).length,
    [systems]
  );
  const totalGpuNodes = useMemo(
    () => systems.filter((node: any) => node.gres).length,
    [systems]
  );
  const totalIdleNodes = useMemo(
    () => systems.filter((node: any) => node.state[0] === "IDLE").length,
    [systems]
  );
  const totalNodes = useMemo(() => systems.length, [systems]);
  const totalAllocatedNodes = useMemo(
    () => systems.filter((node: any) => node.state[0] === "ALLOCATED").length,
    [systems]
  );
  const totalDownNodes = useMemo(
    () => systems.filter((node: any) => node.state[0] === "DOWN").length,
    [systems]
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <DateTimePicker
          date={selectedDate}
          setDate={setSelectedDate}
          time={selectedTime}
          setTime={setSelectedTime}
        />
      </div>
      {error && (
        <div className="text-red-500 mb-4">
          <p>Error loading historical data: {error.message}</p>
          <p>Please check the console for more details.</p>
        </div>
      )}
      {historicalData && (
        <Card>
          <CardHeader>
            <CardTitle>
              Historical Data: {format(selectedDate!, "yyyy-MM-dd")} at{" "}
              {selectedTime}
              <div className="text-sm">
                <div className="flex justify-start w-full my-2 gap-2 items-center">
                  <div className="flex items-center gap-2 font-extralight">
                    GPU Nodes
                    <span className="text-blue-400">{totalGpuNodes}</span>
                  </div>
                  <div className="flex items-center gap-2 font-extralight">
                    CPU Nodes
                    <span className="text-blue-400">{totalCpuNodes}</span>
                  </div>
                  <div className="flex items-center gap-2 font-extralight">
                    IDLE Nodes
                    <span className="text-blue-400">{totalIdleNodes}</span>
                  </div>
                  <div className="flex items-center gap-2 font-extralight">
                    DOWN Nodes
                    <span className="text-blue-400">{totalDownNodes}</span>
                  </div>
                  <div className="flex items-center gap-2 font-extralight">
                    ALLOCATED Nodes
                    <span className="text-blue-400">{totalAllocatedNodes}</span>
                  </div>
                  <div className="flex items-center gap-2 font-extralight">
                    TOTAL Nodes
                    <span className="text-blue-400">{totalNodes}</span>
                  </div>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {historicalData.nodes ? (
              <div className="flex flex-wrap">
                {historicalData.nodes.map((node: any, index: number) => {
                  const { gpuUsed, gpuTotal } = parseGpuInfo(node);
                  return (
                    <NodeCard
                      key={node.hostname}
                      size={100}
                      name={node.hostname}
                      load={node.cpu_load}
                      partitions={node.partitions}
                      features={node.features}
                      coresTotal={node.cpus}
                      coresUsed={node.alloc_cpus}
                      memoryTotal={node.real_memory}
                      memoryUsed={node.alloc_memory}
                      status={node.state}
                      gpuUsed={gpuUsed}
                      gpuTotal={gpuTotal}
                      index={index}
                      nodeData={node}
                      dropdownOpenStatus={{}}
                      toggleDropdown={() => {}}
                      historical={true}
                    />
                  );
                })}
              </div>
            ) : (
              <p>No node data available in the historical data.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardHistory;
