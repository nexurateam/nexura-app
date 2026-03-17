import { useEffect, useState } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import AnimatedBackground from "../../components/AnimatedBackground";
import { useToast } from "../../hooks/use-toast";
import { projectApiRequest, getStoredProjectInfo } from "../../lib/projectApi";

type DiscordServer = {
  id: string;
  name: string;
};

type DiscordRole = {
  id: string;
  name: string;
};

export default function ConnectedDiscord() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const [_, setLocation] = useLocation();
  const [discordData, setDiscordData] = useState<DiscordServer[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingRoles, setLoadingRoles] = useState(false);

  // Dropdown states
  const [serverOpen, setServerOpen] = useState(false);
  const [rolesOpen, setRolesOpen] = useState(false);
  const [roles, setRoles] = useState<DiscordRole[]>([]);
  const [selectedServer, setSelectedServer] = useState<DiscordServer>({ id: "", name: "" });
  const [selectedRole, setSelectedRole] = useState<string>("");

  const { toast } = useToast();

  useEffect(() => {
    const hasFullSession =
      !!localStorage.getItem("nexura-project:token") ||
      !!localStorage.getItem("nexura:proj-token");
    if (!hasFullSession) {
      localStorage.setItem("nexura:studio-step", "/connected-discord");
    }

    if (!id) {
      setLoading(false);
      toast({
        title: "Missing Discord session",
        description: "Please reconnect Discord to continue.",
        variant: "destructive",
      });
      setLocation("/connect-discord");
      return;
    }

    fetchDiscordData();
  }, []);
  
  async function fetchDiscordData() {
    try {
      setLoading(true);
      const { servers } = await projectApiRequest<{ servers: { id: string; name: string }[] }>({ method: "GET", endpoint: `/hub/get-servers?id=${id}` });
      setDiscordData(servers);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
      toast({ title: "Error", description: "Failed to fetch server data", variant: "destructive" });
    }
  }

  async function fetchRoles(serverId: string) {
    if (!id || !serverId) return;
    try {
      setLoadingRoles(true);
      const { roles } = await projectApiRequest<{ roles: DiscordRole[] }>({
        method: "GET",
        endpoint: `/hub/get-roles?serverId=${serverId}&id=${id}`,
      });
      setRoles(roles);
      setLoadingRoles(false);
    } catch (error) {
      setLoadingRoles(false);
      console.error(error);
      toast({ title: "Error", description: "Failed to fetch roles", variant: "destructive" });
    }
  }

  async function createHub() {
    if (!selectedServer.id) {
      toast({ title: "Select a server", description: "Please choose your Discord server first.", variant: "destructive" });
      return;
    }

    if (!selectedRole) {
      toast({ title: "Select a role", description: "Please choose a role for verification.", variant: "destructive" });
      return;
    }

    try {

      await projectApiRequest({
        method: "PATCH",
        endpoint: `/hub/update-ids`,
        data: {
          verifiedId: selectedRole,
          guildId: selectedServer.id,
          discordServer: selectedServer.name,
          discordSessionId: id,
        },
      });

      if (id) {
        const existingInfo = getStoredProjectInfo() ?? {};
        localStorage.setItem(
          "nexura-project:info",
          JSON.stringify({ ...existingInfo, discordSessionId: id })
        );
      }

      toast({ title: "Success", description: "Discord connected successfully.", variant: "default" });

      setLocation("/studio-dashboard");
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to connect Discord", variant: "destructive" });
    }
  }

  // Guard render: wait until discordData is ready
  if (loading || !discordData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-black">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-black text-white space-y-8 relative">
      <AnimatedBackground />

      <Card className="bg-[#060210] border border-purple-500 rounded-2xl w-full max-w-xl p-6 space-y-6 relative z-10">

        <div className="flex justify-center">
          <img
            src="/connect-check.png"
            alt="Connected Check"
            className="w-16 h-16"
          />
        </div>

        <h1 className="text-2xl sm:text-3xl font-semibold text-white text-center">
          Discord Account Connected
        </h1>

        <p className="text-white/60 text-center sm:text-base max-w-sm mx-auto">
          Finalize your server and role synchronization to start managing your project
        </p>

        {/* Server Dropdown */}
        <div className="w-full">
          <div
            onClick={() => setServerOpen(!serverOpen)}
            className="rounded-2xl p-4 cursor-pointer flex justify-between items-center border border-purple-500"
            style={{ backgroundColor: "#8B3EFE1A" }}
          >
            <div className="flex flex-col">
              <span className="text-white font-semibold text-lg">Select Server</span>
              <span className="text-white/60 text-sm">
                {selectedServer ? selectedServer.name : "Choose an Active Server"}
              </span>
            </div>

            <ArrowRight
              className={`h-5 w-5 transition-transform ${serverOpen ? "rotate-90" : ""}`}
            />
          </div>

          {serverOpen && (
            <div className="mt-3 space-y-2">
              {discordData.map((server, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedServer(server);
                    setSelectedRole("");
                    setRoles([]);
                    setServerOpen(false);
                    fetchRoles(server.id);
                  }}
                  className="bg-gray-900 px-4 py-2 rounded-2xl border border-purple-500 text-white cursor-pointer hover:bg-gray-800"
                >
                  {server.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Roles Dropdown */}
        <div className="w-full">
          <div
            onClick={() => setRolesOpen(!rolesOpen)}
            className="rounded-2xl p-4 cursor-pointer flex justify-between items-center border border-purple-500"
            style={{ backgroundColor: "#8B3EFE1A" }}
          >
            <span className="text-white font-semibold text-lg">
              Select Roles for Verification
            </span>

            <ArrowRight
              className={`h-5 w-5 transition-transform ${rolesOpen ? "rotate-90" : ""}`}
            />
          </div>

          {rolesOpen && (
            <div className="mt-3 space-y-3">
              {loadingRoles && (
                <div className="bg-gray-900 px-4 py-3 rounded-2xl border border-purple-500 text-white/70 text-sm">
                  Loading roles...
                </div>
              )}
              {!loadingRoles && roles.length === 0 && (
                <div className="bg-gray-900 px-4 py-3 rounded-2xl border border-purple-500 text-white/70 text-sm">
                  {selectedServer.id ? "No roles found for this server." : "Select a server first to load roles."}
                </div>
              )}
              {roles.map((role, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-gray-900 px-4 py-2 rounded-2xl border border-purple-500"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-3 h-3 rounded-full block"
                      style={{ backgroundColor: "#FFD700" }}
                    ></span>
                    <span className="text-white">{role.name}</span>
                  </div>

                  <input
                    type="radio"
                    name="selectedRole"
                    className="w-5 h-5 accent-purple-500"
                    value={role.id}
                    checked={selectedRole === role.id}
                    onChange={() => setSelectedRole(role.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        <Button onClick={createHub} className="w-full text-white bg-[#8B3EFE] hover:bg-[#8B3EFE] flex items-center justify-center gap-2 mt-4">
          Continue to Dashboard
          <ArrowRight className="h-5 w-5" />
        </Button>
      </Card>
    </div>
  );
}
