"use client";
import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Disaster } from "../types/disaster.type";
import { DEFAULT_UNITS } from "../lib/getUnitByType";
import { Input } from "@/components/ui/input";
interface CollectionDialogProps {
  onSelect: (name: string) => void;
  onJsonLoad: (rows: Disaster[]) => void;
}
export default function CollectionDialog({
  onSelect,
  onJsonLoad,
}: CollectionDialogProps) {
  const [collections, setCollections] = useState<string[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/collections")
      .then((res) => res.json())
      .then(setCollections);
  }, []);

  const handleConfirm = () => {
    if (selected) onSelect(selected);
  };
  // JSON import handler
  const handleJsonFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const arr = JSON.parse(reader.result as string);
        if (!Array.isArray(arr)) throw new Error("JSON must be an array");
        const parsed: Disaster[] = arr.map((row, i) => ({
          _id: row._id?.toString() ?? `json-${i}`,
          place: row.place ?? "",
          latitude: Number(row.latitude),
          longitude: Number(row.longitude),
          time: new Date(row.time ?? row.date_time).toISOString(),
          magnitude_value:
            Number(row.magnitude_value ?? row.magnitude) ?? 0,
          magnitude_unit:
            row.magnitude_unit ??
            DEFAULT_UNITS[row.type as Disaster["type"]] ??
            "",
          source: row.source ?? "JSON",
          type: (row.type as Disaster["type"]) ?? "Unknown",
          description: row.description ?? null,
        }));
        onJsonLoad(parsed);
        setOpen(false);
      } catch (e) {
        console.error("Invalid JSON file:", e);
        alert(
          "Failed to parse JSON: " +
            (e instanceof Error ? e.message : "Unknown error")
        );
      }
    };
    reader.readAsText(file);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className=" text-white rounded-md">
        <Button
          className="bg-raisin-black text-white rounded-md cursor-pointer hoverBtn"
          variant="outline"
        >
          <FileDown size={16} />
          Import Data
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Choose Data Source</DialogTitle>
          <DialogDescription>
            Select a MongoDB collection or import a JSON file.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="mongo" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger className="cursor-pointer" value="mongo">
              MongoDB Collections
            </TabsTrigger>
            <TabsTrigger className="cursor-pointer" value="json">
              Import JSON
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mongo" className="mt-4">
            <div className="space-y-2">
              <Select
                value={selected}
                onValueChange={(value) => setSelected(value)}
              >
                <SelectTrigger className="border rounded px-3 py-1 text-sm w-full cursor-pointer">
                  <SelectValue placeholder="Select a collection" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>My collections</SelectLabel>
                    {collections.map((col) => (
                      <SelectItem
                        className="cursor-pointer"
                        key={col}
                        value={col}
                      >
                        {col}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="secondary"
                  className="cursor-pointer mt-3.5"
                >
                  Close
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleConfirm}
                  disabled={!selected}
                  className="bg-raisin-black text-white rounded-md cursor-pointer mt-3.5 hoverBtn"
                  style={{ position: "relative", left: "260px" }}
                >
                  Load Collections
                </Button>
              </DialogClose>
            </div>
          </TabsContent>

          <TabsContent value="json" className="mt-4 space-y-2">
            <p className="text-sm text-gray-500">
              Upload a JSON file containing an array of disasters.
            </p>
            <Input
              type="file"
              accept="application/json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleJsonFile(file);
              }}
              className="block w-full text-sm text-gray-700 cursor-pointer"
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
