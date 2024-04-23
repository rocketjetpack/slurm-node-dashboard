import { SeparatorMed } from "@/components/ui/separator-med";
import IconComponent from "./gpuIcon";
import { MoreHorizontal, SearchIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { useState } from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";

interface BaseCardProps {
  name: string;
  load: number;
  partitions: string;
  features: string;
  coresUsed: number;
  coresTotal: number;
  memoryUsed: number;
  memoryTotal: number;
  status: string;
  data: any;
  gpuUsed: number;
  gpuTotal: number;
  toggleDropdown: (index: number) => void;
  dropdownOpenStatus: any;
  index: number;
}

interface GpuAllocation {
  type: string; // Can now include more variations
  count: number;
  indexRange?: string;
}

interface ComponentData {
  hostname: string;
  features: string[];
  partitions: string[];
  owner: string;
  gres: string;
  gres_used: string;
}

function parseGpuAllocations(gresString: string): GpuAllocation[] {
  return gresString.split(",").map((item) => {
    const parts = item.split(":");
    const count = parseInt(parts[2], 10);

    // Construct the type even if the count is zero
    return { type: parts[0] + ":" + parts[1], count };
  });
}

function parseUsedGpuAllocations(gresUsedString: string): GpuAllocation[] {
  return gresUsedString.split(",").map((item) => {
    const [typeAndCount, indexRange] = item.split("(");
    const parts = typeAndCount.split(":");
    const count = parseInt(parts[2], 10);

    return { type: parts[0] + ":" + parts[1], count, indexRange };
  });
}

function getStatusColor(status: string): string {
  const statusLevel = status[1] || status[0];
  switch (statusLevel) {
    case "DRAIN":
    case "NOT_RESPONDING":
    case "DOWN":
      return "bg-blue-400";
    case "IDLE":
      return "bg-green-700";
    case "MIXED":
      return "bg-orange-800";
    case "PLANNED":
      return "bg-purple-500";
    case "ALLOCATED":
      return "bg-red-900";
    case "COMPLETING":
      return "bg-yellow-500";
    default:
      return "bg-gray-900";
  }
}

function getStatusDef(status: string): string {
  const statusLevel = status[1] || status[0];

  switch (statusLevel) {
    case "DRAIN":
    case "NOT_RESPONDING":
    case "DOWN":
      return "This System is currently unavailable. This could be due to maintenance, or hardware issues.";

    case "IDLE":
      return "System is idle ready for use.";

    case "MIXED":
      return "System is currently in use, but not fully allocated.";

    case "ALLOCATED":
      return "System is fully allocated.";

    case "COMPLETING":
      return "System is currently in the process of completing a task.";

    case "PLANNED":
      return "System is being prepared for use.";

    default:
      return "System status unknown, this is likely due to the system being offline.";
  }
}

function CardContent(props: BaseCardProps) {
  return (
    <>
      <p className="font-extralight text-xs">
        CPU: {props.coresUsed} / {props.coresTotal}
      </p>
      <p className="font-extralight text-xs">
        MEM: {props.memoryUsed} / {props.memoryTotal}
      </p>
      {props.gpuUsed !== undefined &&
        props.gpuTotal !== undefined &&
        props.gpuTotal !== 0 && (
          <p className="font-extralight text-xs">
            GPU: {props.gpuUsed} / {props.gpuTotal}
          </p>
        )}
    </>
  );
}

export const NodeCard = ({
  name,
  load,
  partitions,
  features,
  coresUsed,
  coresTotal,
  memoryUsed,
  memoryTotal,
  status,
  gpuUsed,
  gpuTotal,
  data,
  toggleDropdown,
  dropdownOpenStatus,
  index,
}: BaseCardProps) => {
  const [open, setOpen] = useState(false);
  const color = getStatusColor(status);
  const statusDef = getStatusDef(status);
  const gpuAllocations = parseGpuAllocations(data.gres);
  const usedGpuAllocations = parseUsedGpuAllocations(data.gres_used);

  if (status[1]) {
    status = status[1];
  } else {
    status = status[0];
  }

  return (
    <HoverCard>
      <div className="border-[1px] m-2 p-2 rounded-[5px] bg-card text-card-foreground shadow-xl w-full sm:w-[200px]">
        <div className="p-1 items-center justify-center">
          <div className="flex justify-between">
            <div className="text-xl font-bold pb-1">{name}</div>
          </div>
          <SeparatorMed />{" "}
          <HoverCardTrigger asChild>
            <div className="text-sm p-1">
              <CardContent
                name={name}
                load={load}
                partitions={partitions}
                features={features}
                coresUsed={coresUsed}
                coresTotal={coresTotal}
                memoryUsed={memoryUsed}
                memoryTotal={memoryTotal}
                status={status}
                gpuUsed={gpuUsed}
                data={data}
                gpuTotal={gpuTotal}
                toggleDropdown={toggleDropdown}
                dropdownOpenStatus={dropdownOpenStatus}
                index={0}
              />
              <IconComponent num_used={gpuUsed} num_total={gpuTotal} />
            </div>
          </HoverCardTrigger>
          <div className="text-sm font-light">
            <p className={`${color} rounded-[5px] text-center mt-2 p-1`}>
              {status}
            </p>
          </div>
        </div>
      </div>
      <HoverCardContent className="w-96 m-5 font-extralight text-sm">
        <div>Hostname: {data.hostname}</div>
        <div className="flex flex-wrap items-center">
          Features:
          {data.features.map((feature: any, index: any) => (
            <div
              className="p-1 border-2 rounded-lg m-1 text-sm font-extralight"
              key={index}
            >
              {feature}
            </div>
          ))}
        </div>
        <div className="flex w-full items-center">
          Partitions:
          {data.partitions.map((partition: any, index: any) => (
            <div
              className="p-1 border-2 rounded-lg m-1 text-sm font-extralight w-fit"
              key={index}
            >
              {partition}
            </div>
          ))}
        </div>
        {data.gres === "" ? null : (
          <>
            <div className="flex w-full items-center">
              GPUs (Total):
              {gpuAllocations.map((gpu, index) => (
                <div
                  className="p-1 border-2 rounded-lg m-1 text-sm font-extralight w-fit"
                  key={index}
                >
                  {gpu.type} (
                  <span className="text-red-500 font-bold">{gpu.count}</span>)
                </div>
              ))}
            </div>
            <div className="flex w-full items-center">
              GPUs (Used):
              {usedGpuAllocations
                .filter((gpu) => gpu.indexRange !== undefined)
                .map((gpu, index) => (
                  <div
                    className="p-1 border-2 rounded-lg m-1 text-sm font-extralight"
                    key={index}
                  >
                    {gpu.type} (
                    <span className="text-red-500 font-bold">{gpu.count}</span>)
                  </div>
                ))}
            </div>
          </>
        )}
        <div>
          Note:
          <div className="p-1 border-2 rounded-lg m-1 text-sm font-extralight">
            {statusDef}
          </div>
          {data.reason === "" ? null : (
            <>
              Reason:
              <div className="p-1 border-2 rounded-lg m-1 text-sm font-extralight">
                {data.reason}
              </div>
            </>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
